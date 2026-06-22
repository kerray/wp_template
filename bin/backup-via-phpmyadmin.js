const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { execSync } = require('child_process'); // For gzip
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// --- Simple Debug Switch ---
const DEBUG_MODE = true; // Set to false to disable debug logs, screenshots, etc.

// --- Configuration ---
const config = {
    pmaUrl: process.env.PMA_URL || 'https://phpmyadmin.example.com/', // Ensure trailing slash if needed
    username: process.env.PMA_USERNAME || process.env.REMOTE_DB_ADMIN_USER,
    password: process.env.PMA_PASSWORD || process.env.REMOTE_DB_ADMIN_PASS,
    database: process.env.PMA_DATABASE || process.env.REMOTE_DB_NAME,
    downloadPath: path.resolve(__dirname, '../backups'),
    siteName: process.env.SITE_NAME || 'mysite',
    headless: process.env.PMA_HEADLESS !== 'false',
    slowMo: parseInt(process.env.PMA_SLOW_MO, 10) || (DEBUG_MODE ? 50 : 0), // Slow down if debugging
    downloadWaitTime: parseInt(process.env.PMA_DOWNLOAD_WAIT, 10) || 30000, // ms
    compressBackup: process.env.PMA_COMPRESS_BACKUP !== 'false',
};

// --- Simplified Selectors ---
const SELECTORS = {
    LOGIN: {
        username: ['input[name="pma_username"]', '#input_username'],
        password: ['input[name="pma_password"]', '#input_password'],
        submit: ['input[value="Go"]', '#input_go', 'input[type="submit"]'],
        loginError: ['.error', '#pma_errors', 'div.error', 'span.error', 'div.alert-danger'],
    },
    EXPORT: {
        // Selectors needed ON the db_export.php page
        goButton: [
            '#buttonGo', // This worked in the log
            'input[value="Go"]',
            'input[type="submit"][name="submit_export"]',
            'input[type="submit"]',
            'button[type="submit"].btn.btn-primary',
            'button[type="submit"]',
        ],
        // Optional: Keep if you want to ensure specific settings
        sqlFormatRadio: '#radio_export_format_sql, input[name="what"][value="sql"], input[value="sql"]',
        dropTableCheckbox: '#checkbox_sql_drop_table, input[name="sql_drop_table"]',
        charsetDropdown: 'select[name="charset"], #select_charset',
        exportForm: 'form[action*="export.php"]', // To verify we're on the export page
    },
    GENERAL: {
        // Selectors to find token in various places
        tokenLink: 'a[href*="token="]',
        frameWithToken: 'frame[src*="token="]',
        scriptWithToken: 'script:contains("var token =")'
    }
};

class PhpMyAdminAutomator {
    constructor(cfg) {
        this.config = cfg;
        this.browser = null;
        this.page = null;
        this.debugDir = null;
        this.debugLogPath = null;
        this.token = null; // To store the PMA session token

        if (DEBUG_MODE) {
            this._setupDebugging();
        }
    }

    _setupDebugging() {
        const timestamp = moment().format('YYYYMMDD_HHmmss');
        this.debugDir = path.join(this.config.downloadPath, `debug_${timestamp}`);
        if (!fs.existsSync(this.debugDir)) {
            fs.mkdirSync(this.debugDir, { recursive: true });
        }
        this.debugLogPath = path.join(this.debugDir, 'debug_log.txt');
        this.log(`Debug information will be saved to: ${this.debugDir}`);
    }

    log(message) {
        // Always log to console
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        // Log to file only if debugging is enabled
        if (DEBUG_MODE && this.debugLogPath) {
            fs.appendFileSync(this.debugLogPath, logMessage + '\n');
        }
    }

    async _saveDebugScreenshot(name) {
        if (!DEBUG_MODE || !this.page || !this.debugDir) return;
        const filePath = path.join(this.debugDir, `${name}.png`);
        try {
            await this.page.screenshot({ path: filePath, fullPage: true });
            this.log(`Debug screenshot saved: ${filePath}`);
        } catch (error) {
            this.log(`Failed to save debug screenshot ${name}: ${error.message}`);
        }
    }

    async _saveDebugHtml(name) {
        if (!DEBUG_MODE || !this.page || !this.debugDir) return;
        const filePath = path.join(this.debugDir, `${name}.html`);
        try {
            const content = await this.page.content();
            fs.writeFileSync(filePath, content);
            this.log(`Debug HTML saved: ${filePath}`);
        } catch (error) {
            this.log(`Failed to save debug HTML ${name}: ${error.message}`);
        }
    }

    async _waitForSelectorAndClick(selectors, description, timeout = 10000) {
        this.log(`Trying to find and click: ${description}`);
        for (const selector of selectors) {
            try {
                this.log(` - Waiting for selector: ${selector}`);
                // Ensure the element is visible and enabled before clicking
                await this.page.waitForSelector(selector, { visible: true, timeout: timeout });
                 const element = await this.page.$(selector); // Get element handle
                 const isEnabled = await element.evaluate(node => !node.disabled);
                 if(isEnabled) {
                    this.log(`   Found visible and enabled element. Clicking ${description} using selector: ${selector}`);
                    await this.page.click(selector);
                    return true; // Success
                 } else {
                    this.log(`   Selector ${selector} found but is disabled.`);
                 }
            } catch (error) {
                this.log(`   Selector ${selector} not found or visible within ${timeout}ms: ${error.message}`);
            }
        }
        this.log(`Failed to find a clickable element for: ${description}`);
        await this._saveDebugScreenshot(`click_fail_${description.replace(/\s+/g, '_')}`);
        await this._saveDebugHtml(`click_fail_${description.replace(/\s+/g, '_')}`);
        return false; // Failure
    }

    async _waitForSelectorAndType(selectors, value, description, timeout = 10000) {
        this.log(`Trying to find and type into: ${description}`);
        for (const selector of selectors) {
            try {
                this.log(` - Waiting for selector: ${selector}`);
                await this.page.waitForSelector(selector, { visible: true, timeout: timeout });
                this.log(`   Found. Typing into ${description} using selector: ${selector}`);
                await this.page.type(selector, value, { delay: 50 }); // Add small delay
                return true; // Success
            } catch (error) {
                 this.log(`   Selector ${selector} not found or visible within ${timeout}ms: ${error.message}`);
            }
        }
        this.log(`Failed to find an element to type into for: ${description}`);
        await this._saveDebugScreenshot(`type_fail_${description.replace(/\s+/g, '_')}`);
        return false; // Failure
    }

    // Helper to wait using setTimeout
    async _wait(duration) {
        this.log(`Waiting for ${duration}ms...`);
        await new Promise(resolve => setTimeout(resolve, duration));
    }

    async initialize() {
        this.log('Launching browser...');
        this.browser = await puppeteer.launch({
            headless: this.config.headless,
            slowMo: this.config.slowMo,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-cookies'],
        });

        this.page = await this.browser.newPage();
        this.log('Browser launched, new page created.');

        // Configure download behavior
        this.log(`Configuring downloads to: ${this.config.downloadPath}`);
        const client = await this.page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: this.config.downloadPath,
        });

        await this.page.setViewport({ width: 1366, height: 768 }); // Consistent viewport size
    }

    async _extractToken() {
        this.log('Attempting to extract session token...');
        try {
            // Method 1: Try to extract token from JavaScript variables in the page
            this.token = await this.page.evaluate(() => {
                // Check if token is defined as a JavaScript variable
                if (typeof token !== 'undefined') {
                    return token;
                }
                
                // Look for token in script tags
                const scriptContent = document.documentElement.innerHTML;
                const tokenVarMatch = scriptContent.match(/var\s+token\s*=\s*['"]([a-f0-9]+)['"]/);
                if (tokenVarMatch && tokenVarMatch[1]) {
                    return tokenVarMatch[1];
                }
                
                // Look for token in common_query
                const commonQueryMatch = scriptContent.match(/var\s+common_query\s*=\s*['"]token=([a-f0-9]+)['"]/);
                if (commonQueryMatch && commonQueryMatch[1]) {
                    return commonQueryMatch[1];
                }
                
                return null;
            });
            
            // Method 2: If not found in JS variables, try to extract from frame src attributes
            if (!this.token) {
                this.token = await this.page.evaluate(() => {
                    const frames = document.querySelectorAll('frame[src*="token="]');
                    for (const frame of frames) {
                        const tokenMatch = frame.src.match(/token=([a-f0-9]+)/);
                        if (tokenMatch && tokenMatch[1]) {
                            return tokenMatch[1];
                        }
                    }
                    return null;
                });
            }
            
            // Method 3: If still not found, try the original method with links
            if (!this.token) {
                this.token = await this.page.evaluate((selector) => {
                    const links = Array.from(document.querySelectorAll(selector));
                    for (const link of links) {
                        const tokenMatch = link.href.match(/token=([a-f0-9]+)/);
                        if (tokenMatch && tokenMatch[1]) {
                            return tokenMatch[1];
                        }
                    }
                    return null;
                }, SELECTORS.GENERAL.tokenLink);
            }

            if (this.token) {
                this.log(`Successfully extracted token: ${this.token}`);
                return true;
            } else {
                this.log('Could not find a token using any extraction method.');
                await this._saveDebugHtml('token_extraction_failed');
                return false;
            }
        } catch (error) {
            this.log(`Error during token extraction: ${error.message}`);
            await this._saveDebugScreenshot('token_extraction_error');
            await this._saveDebugHtml('token_extraction_error');
            return false;
        }
    }

    async loginAndGetToken() {
        this.log(`Navigating to phpMyAdmin login page: ${this.config.pmaUrl}`);
        try {
            await this.page.goto(this.config.pmaUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await this._wait(1000); // Allow dynamic elements to potentially load
        } catch (error) {
            await this._saveDebugScreenshot('login_page_load_fail');
            throw new Error(`Failed to navigate to PMA login page: ${error.message}`);
        }

        await this._saveDebugScreenshot('login_page');
        await this._saveDebugHtml('login_page');
        this.log('Attempting to log in...');

        if (!await this._waitForSelectorAndType(SELECTORS.LOGIN.username, this.config.username, 'Username Field')) {
             throw new Error('Could not find or type into the username field.');
        }
        if (!await this._waitForSelectorAndType(SELECTORS.LOGIN.password, this.config.password, 'Password Field')) {
            throw new Error('Could not find or type into the password field.');
       }

        await this._saveDebugScreenshot('before_login_click');
        if (!await this._waitForSelectorAndClick(SELECTORS.LOGIN.submit, 'Login Button')) {
             throw new Error('Could not find or click the login button.');
        }

        try {
             this.log('Waiting for page load after login submission...');
             await this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 });
             await this._wait(2000); // Extra wait for potential JS redirects/updates and token links to appear
        } catch (error) {
             this.log(`Navigation timeout/error after login: ${error.message}. Checking page state.`);
             // Continue, but check for errors below
        }

        await this._saveDebugScreenshot('after_login_attempt');
        await this._saveDebugHtml('after_login_attempt');

        // Check for login errors explicitly
        const loginError = await this.page.evaluate((selectors) => {
             for (const selector of selectors) {
                 const el = document.querySelector(selector);
                 if (el && el.offsetParent !== null) { // Check if visible
                    const text = el.innerText.trim();
                    if (text && (text.includes("Cannot log in") || text.includes("#1045") || text.includes("Access denied") || text.includes("failed"))) {
                        return text;
                    }
                 }
             }
             return null;
         }, SELECTORS.LOGIN.loginError);

        if (loginError) {
            this.log(`Login failed. Error detected: ${loginError}`);
            throw new Error(`Login failed: ${loginError}`);
        }
        this.log('Login appears successful.');

        // Extract the token
        if (!await this._extractToken()) {
            throw new Error('Login succeeded, but failed to extract session token.');
        }
    }

    async goToExportPageDirectly() {
        if (!this.token) {
            throw new Error("Cannot navigate to export page: token not available.");
        }

        // Construct the direct URL to the database export page
        // Base URL logic might need adjustment depending on PMA structure
        const baseUrl = this.config.pmaUrl.replace(/index\.php.*$/, ''); // Remove index.php if present
        const exportUrl = `${baseUrl}db_export.php?db=${encodeURIComponent(this.config.database)}&token=${this.token}`;

        this.log(`Navigating directly to export page: ${exportUrl}`);
        try {
            await this.page.goto(exportUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await this._wait(2000); // Wait for page elements to potentially render
        } catch (error) {
            await this._saveDebugScreenshot('export_page_direct_nav_fail');
            await this._saveDebugHtml('export_page_direct_nav_fail');
            throw new Error(`Failed to navigate directly to export page: ${error.message}`);
        }

        // Verify we are on the export page by looking for the 'Go' button or the form
        try {
             await this.page.waitForSelector(
                 [...SELECTORS.EXPORT.goButton, SELECTORS.EXPORT.exportForm].join(','),
                 { visible: true, timeout: 15000 }
            );
             this.log('Successfully loaded direct export page.');
             await this._saveDebugScreenshot('export_page_loaded');
             await this._saveDebugHtml('export_page_loaded');
        } catch (error) {
             await this._saveDebugScreenshot('export_page_verify_fail');
             await this._saveDebugHtml('export_page_verify_fail');
             throw new Error(`Navigated to ${exportUrl}, but failed to verify export page elements: ${error.message}`);
        }
    }

    async configureAndTriggerExport() {
        this.log('Configuring export settings (optional)...');
        try {
            // Example: Ensure SQL format (often default, but can be explicit)
            const sqlRadio = await this.page.$(SELECTORS.EXPORT.sqlFormatRadio);
             if (sqlRadio) {
                 const isChecked = await sqlRadio.evaluate(node => node.checked);
                 if (!isChecked) {
                     await this.page.click(SELECTORS.EXPORT.sqlFormatRadio);
                     this.log('Selected SQL format.');
                 }
             } else { this.log('SQL format radio not found, assuming default is okay.'); }

             // Example: Ensure "Add DROP TABLE" is checked
             const dropTableCheck = await this.page.$(SELECTORS.EXPORT.dropTableCheckbox);
             if (dropTableCheck) {
                  const isChecked = await dropTableCheck.evaluate(node => node.checked);
                  if (!isChecked) {
                     await this.page.click(SELECTORS.EXPORT.dropTableCheckbox);
                      this.log('Checked "Add DROP TABLE / IF NOT EXISTS" option.');
                  }
              } else { this.log('"DROP TABLE" checkbox not found.'); }

        } catch (e) {
            this.log(`Warning: Error configuring export options: ${e.message}. Using defaults.`);
            await this._saveDebugScreenshot('export_options_config_error');
        }

        this.log('Triggering the export download...');
        await this._saveDebugScreenshot('before_export_go_click');

        // Click the "Go" or "Export" button
        if (!await this._waitForSelectorAndClick(SELECTORS.EXPORT.goButton, '"Go" Button', 15000)) {
             throw new Error('Could not find or click the Go/Export button on the export page.');
        }
        this.log('Export process initiated (Go button clicked).');
    }

    async waitForAndVerifyDownload(targetFilename) {
        this.log(`Waiting ${this.config.downloadWaitTime / 1000} seconds for download to complete...`);
        await this._wait(this.config.downloadWaitTime);
        await this._saveDebugScreenshot('after_download_wait');

        this.log('Verifying downloaded file...');
        let files = [];
        try {
             files = fs.readdirSync(this.config.downloadPath);
        } catch (readDirError) {
            this.log(`Error reading download directory ${this.config.downloadPath}: ${readDirError.message}`);
            throw new Error(`Failed to read download directory: ${this.config.downloadPath}`);
        }
        this.log(`Files in download directory: ${files.join(', ')}`);

        const recentFiles = files
            .map(file => {
                try {
                    const filePath = path.join(this.config.downloadPath, file);
                    return {
                        name: file,
                        path: filePath,
                        stats: fs.statSync(filePath)
                    };
                } catch (statError) {
                    this.log(`Could not stat file ${file}: ${statError.message}`);
                    return null; // Skip files that can't be stat'd
                }
            })
            .filter(f => f && f.stats.isFile() && f.stats.mtime > new Date(Date.now() - (this.config.downloadWaitTime + 15000))) // Check files modified recently + buffer
            .sort((a, b) => b.stats.mtime - a.stats.mtime); // Sort by most recent first

        this.log(`Found ${recentFiles.length} recent files matching criteria.`);

        let downloadedSqlFile = null;

        if (recentFiles.length > 0) {
             // Check if any recent file *looks* like our SQL dump (name or content)
             for (const fileInfo of recentFiles) {
                 const looksLikeBackup = fileInfo.name.endsWith('.sql') ||
                                        fileInfo.name.includes(this.config.database) ||
                                        fileInfo.name.includes(this.config.siteName) ||
                                        fileInfo.name.toLowerCase().includes('dump') ||
                                        fileInfo.name.toLowerCase().includes('export'); // More general names

                 if (looksLikeBackup && fileInfo.stats.size > 100) { // Basic sanity check for size
                     this.log(`Found potential backup file: ${fileInfo.name} (Size: ${fileInfo.stats.size} bytes)`);
                     // Verify content minimally
                     try {
                         const contentStart = fs.readFileSync(fileInfo.path, { encoding: 'utf8', flag: 'r' }).substring(0, 2048);
                          if (contentStart.includes('CREATE TABLE') || contentStart.includes('INSERT INTO') || contentStart.includes('-- phpMyAdmin SQL Dump')) {
                             this.log(`Confirmed SQL content in ${fileInfo.name}.`);
                             downloadedSqlFile = fileInfo;
                             break; // Found a good candidate
                          } else {
                             this.log(`File ${fileInfo.name} might be a backup but doesn't contain expected SQL commands at the start.`);
                             if (DEBUG_MODE) {
                                 try { fs.copyFileSync(fileInfo.path, path.join(this.debugDir, `downloaded_non_sql_${fileInfo.name}.txt`)); } catch {}
                             }
                          }
                     } catch (readError) {
                         this.log(`Error reading file ${fileInfo.name} for verification: ${readError.message}`);
                     }
                 } else if (DEBUG_MODE && looksLikeBackup && fileInfo.stats.size <= 100) {
                    this.log(`File ${fileInfo.name} looks like backup by name but is too small (${fileInfo.stats.size} bytes).`);
                 }
             }
        }

        if (!downloadedSqlFile) {
            // NO fallback to page extraction - if download didn't produce a verifiable file, it failed.
             await this._saveDebugHtml('download_verification_failed');
             throw new Error('Database export failed. No valid SQL file was found in the download directory after waiting.');
        }

        // --- Finalize Backup File ---
        const finalPath = path.join(this.config.downloadPath, targetFilename);
        this.log(`Renaming downloaded file "${downloadedSqlFile.name}" to "${targetFilename}"`);
        try {
            fs.renameSync(downloadedSqlFile.path, finalPath);
        } catch (renameError) {
            this.log(`Error renaming file: ${renameError.message}`);
            throw new Error(`Failed to rename downloaded file "${downloadedSqlFile.name}" to "${targetFilename}".`);
        }
        this.log(`Backup successfully saved to: ${finalPath}`);

        // Optional Compression
        if (this.config.compressBackup) {
            const compressedPath = `${finalPath}.gz`;
            this.log(`Compressing backup to: ${compressedPath}`);
            try {
                execSync(`gzip -f -c "${finalPath}" > "${compressedPath}"`); // -f to overwrite if exists
                this.log('Compression successful.');
                // Optional: Remove original .sql file after compression
                // try { fs.unlinkSync(finalPath); this.log(`Removed original file: ${finalPath}`); } catch (unlinkErr) { this.log(`Warn: Could not remove original file: ${unlinkErr.message}`)}
                 return compressedPath; // Return path to compressed file
            } catch (compressError) {
                this.log(`Error during backup compression: ${compressError.message}`);
                // Fall through to return the uncompressed path if compression fails
            }
        }

        return finalPath; // Return path to uncompressed file
    }


    async close() {
        this.log('Closing browser...');
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
            this.log('Browser closed.');
        }
    }

    // --- Main Orchestration Method ---
    async backupDatabase() {
        this.log(`Starting database backup of ${this.config.siteName} via phpMyAdmin...`);
        if (DEBUG_MODE) this.log(`Debug mode is ON. Logs/screenshots will be saved to ${this.debugDir}`);
        else this.log(`Debug mode is OFF.`);

        const timestamp = moment().format('YYYYMMDD_HHmmss');
        const backupFilename = `${this.config.siteName}_db_backup_${timestamp}.sql`;
        let finalBackupPath = null;

        try {
            await this.initialize();
            await this.loginAndGetToken();
            await this.goToExportPageDirectly();
            await this.configureAndTriggerExport();
            finalBackupPath = await this.waitForAndVerifyDownload(backupFilename);
            this.log(`Database backup process completed successfully.`);
            return finalBackupPath;
        } catch (error) {
            this.log(`Error during database backup: ${error.message}`);
            await this._saveDebugScreenshot('backup_error_final_state');
            await this._saveDebugHtml('backup_error_final_state');
            // Rethrow the error so the caller knows it failed
            throw error;
        } finally {
            await this.close(); // Ensure browser always closes
        }
    }
}

// --- Execution Logic ---
async function runBackup() {
    console.log("Starting backup script...");

    // Create backups directory if it doesn't exist
    if (!fs.existsSync(config.downloadPath)) {
        console.log(`Creating backup directory: ${config.downloadPath}`);
        try {
            fs.mkdirSync(config.downloadPath, { recursive: true });
        } catch (mkdirError) {
             console.error(`FATAL: Could not create backup directory ${config.downloadPath}: ${mkdirError.message}`);
             process.exit(1);
        }
    }

    const automator = new PhpMyAdminAutomator(config);

    try {
        const backupPath = await automator.backupDatabase();
        console.log('-----------------------------------------');
        console.log(`✅ Database backup finished successfully.`);
        console.log(`   Backup saved to: ${backupPath}`);
        console.log('-----------------------------------------');
        process.exit(0);
    } catch (error) {
        console.error('-----------------------------------------');
        console.error('❌ Database backup failed!');
        // Error message was already logged by the automator instance
        if (DEBUG_MODE && automator.debugDir) {
            console.error(`ℹ️ Check debug logs and screenshots in: ${automator.debugDir}`);
        } else if (!DEBUG_MODE) {
             console.error(`ℹ️ Run with DEBUG_MODE = true for detailed logs.`);
        }
        console.error('-----------------------------------------');
        process.exit(1);
    }
}

// Run only if executed directly
if (require.main === module) {
    runBackup();
}

// Export the class and run function for potential programmatic use
module.exports = {
    PhpMyAdminAutomator,
    runBackup,
    config // Export config for potential external use/modification
};;