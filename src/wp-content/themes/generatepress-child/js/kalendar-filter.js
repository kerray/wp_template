/**
 * Kalendar Filter - Client-Side Event Filtering
 *
 * Handles:
 * - URL hash state management (#kategorie=skola,workshop)
 * - Client-side filtering by category (OR logic)
 * - Text search in event titles
 * - Table rendering with today marker
 * - iCal export generation
 * - Year-based archive viewing
 *
 * Data loaded from PHP via wp_localize_script:
 * - AKCE_DATA: Array of event objects
 * - AKCE_CATEGORIES: Array of category objects
 */

const KalendarApp = {
    // Data storage
    events: [],
    categories: {},
    filtered: [],

    // Settings from shortcode
    settings: {
        mode: 'full',      // 'full' or 'upcoming'
        limit: 0,          // 0 = unlimited
        days: 60           // days ahead for upcoming mode
    },

    // Current filter state
    filters: {
        categories: [],
        searchText: '',
        year: null
    },

    // Search debounce timer
    searchTimer: null,

    /**
     * Initialize the application
     */
    init() {
        console.log('Kalendar: Initializing...');

        // Load settings from PHP
        this.settings = Object.assign(this.settings, window.KALENDAR_SETTINGS || {});
        console.log('Kalendar: Settings:', this.settings);

        // Load data from inline scripts
        this.events = window.AKCE_DATA || [];
        this.categories = window.AKCE_CATEGORIES || [];

        console.log(`Kalendar: Loaded ${this.events.length} events, ${this.categories.length} categories`);

        // Parse URL hash to restore filter state
        this.parseHash();

        // Set up filter checkboxes based on parsed hash
        this.initializeFilters();

        // Apply filters and render
        this.applyFilters();
        this.renderTable();

        // Bind event listeners
        this.bindEvents();

        console.log('Kalendar: Initialization complete');
    },

    /**
     * Parse URL hash and restore filter state
     * Examples:
     * - #kategorie=skola
     * - #kategorie=skola,workshop,slavnost
     * - #2024
     * - #2024&kategorie=skolka
     */
    parseHash() {
        const hash = window.location.hash.substring(1);
        if (!hash) return;

        console.log('Kalendar: Parsing hash:', hash);

        // Check for year (4-digit number at start)
        const yearMatch = hash.match(/^(\d{4})/);
        if (yearMatch) {
            this.filters.year = parseInt(yearMatch[1]);
            console.log('Kalendar: Found year in hash:', this.filters.year);
        }

        // Parse categories from hash
        const params = new URLSearchParams(hash.replace(/^\d{4}&?/, ''));
        const kategorieParam = params.get('kategorie');

        if (kategorieParam) {
            this.filters.categories = kategorieParam.split(',').filter(Boolean);
            console.log('Kalendar: Found categories in hash:', this.filters.categories);
        }
    },

    /**
     * Initialize filter checkboxes based on parsed hash
     */
    initializeFilters() {
        const checkboxes = document.querySelectorAll('.category-filter input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            const slug = checkbox.value;
            if (this.filters.categories.includes(slug)) {
                checkbox.checked = true;
            }
        });
    },

    /**
     * Update URL hash based on current filter state
     * Allows for shareable URLs and browser back/forward
     */
    updateHash() {
        const params = [];

        // Add year if present
        if (this.filters.year) {
            params.push(this.filters.year);
        }

        // Add categories if any selected
        if (this.filters.categories.length > 0) {
            params.push('kategorie=' + this.filters.categories.join(','));
        }

        // Set hash or remove it if no filters
        const hash = params.length > 0 ? '#' + params.join('&') : '';

        // Update without triggering hashchange event
        if (window.location.hash !== hash) {
            history.replaceState(null, '', window.location.pathname + window.location.search + hash);
            console.log('Kalendar: Updated hash:', hash || '(empty)');
        }
    },

    /**
     * Apply current filters to events
     * Uses OR logic for categories (match ANY selected category)
     */
    applyFilters() {
        let filtered = [...this.events];

        // Upcoming mode: filter to only future events within the specified days
        if (this.settings.mode === 'upcoming') {
            const now = Math.floor(Date.now() / 1000);
            const maxDate = now + (this.settings.days * 24 * 60 * 60);

            filtered = filtered.filter(event => {
                // Use dateSort (start date) for filtering
                if (!event.dateSort) return false;
                // Show events that start today or in the future, within the days limit
                return event.dateSort >= now && event.dateSort <= maxDate;
            });
            console.log(`Kalendar: After upcoming filter (${this.settings.days} days): ${filtered.length} events`);
        }

        // Category filter (OR logic)
        if (this.filters.categories.length > 0) {
            filtered = filtered.filter(event => {
                // Event matches if it has ANY of the selected categories
                return event.categories.some(cat =>
                    this.filters.categories.includes(cat)
                );
            });
            console.log(`Kalendar: After category filter: ${filtered.length} events`);
        }

        // Text search (case-insensitive, searches in title)
        if (this.filters.searchText) {
            const search = this.filters.searchText.toLowerCase();
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(search)
            );
            console.log(`Kalendar: After search filter: ${filtered.length} events`);
        }

        // Apply limit if set
        if (this.settings.limit > 0 && filtered.length > this.settings.limit) {
            filtered = filtered.slice(0, this.settings.limit);
            console.log(`Kalendar: After limit (${this.settings.limit}): ${filtered.length} events`);
        }

        this.filtered = filtered;

        // Update event counter
        this.updateCounter();

        // Show/hide no-results message
        this.updateNoResults();
    },

    /**
     * Render the events table
     */
    renderTable() {
        const tbody = document.getElementById('kalendar-tbody');
        if (!tbody) {
            console.error('Kalendar: tbody not found');
            return;
        }

        // Clear existing rows
        tbody.innerHTML = '';

        // No events case
        if (this.filtered.length === 0) {
            const row = document.createElement('tr');
            row.className = 'empty-row';
            row.innerHTML = '<td colspan="3" style="text-align: center; padding: 40px; color: #999;">Žádné akce k zobrazení.</td>';
            tbody.appendChild(row);
            return;
        }

        // Get today's timestamp for comparison
        const today = Math.floor(Date.now() / 1000);
        let todayMarkerShown = false;

        // Render each event
        this.filtered.forEach(event => {
            const row = document.createElement('tr');

            // Add today marker before first future event
            if (!todayMarkerShown && event.dateSort && event.dateSort >= today) {
                row.className = 'today-row';
                todayMarkerShown = true;

                // Show today marker indicator
                const todayIndicator = document.querySelector('.today-marker');
                if (todayIndicator) {
                    todayIndicator.style.display = 'flex';
                }
            }

            // Title cell
            const titleCell = document.createElement('td');
            titleCell.className = 'col-title';
            titleCell.setAttribute('data-label', 'Název');

            if (event.hasLink) {
                const link = document.createElement('a');
                link.href = event.url;
                link.className = 'event-title has-link';
                link.textContent = event.title;
                titleCell.appendChild(link);
            } else {
                const span = document.createElement('span');
                span.className = 'event-title no-link';
                span.textContent = event.title;
                titleCell.appendChild(span);
            }

            // Date cell
            const dateCell = document.createElement('td');
            dateCell.className = 'col-date';
            dateCell.setAttribute('data-label', 'Datum');
            dateCell.innerHTML = `<span class="event-date">${event.dateDisplay || '—'}</span>`;

            // Categories cell
            const catCell = document.createElement('td');
            catCell.className = 'col-categories';
            catCell.setAttribute('data-label', 'Kategorie');

            const catContainer = document.createElement('div');
            catContainer.className = 'event-categories';

            event.categoryNames.forEach((name, index) => {
                const slug = event.categories[index];
                const category = this.categories.find(c => c.slug === slug);
                const color = category ? category.color : '#34495e';

                const badge = document.createElement('span');
                badge.className = 'category-badge';
                badge.style.backgroundColor = color;
                badge.textContent = name;
                catContainer.appendChild(badge);
            });

            catCell.appendChild(catContainer);

            // Append cells to row
            row.appendChild(titleCell);
            row.appendChild(dateCell);
            row.appendChild(catCell);

            tbody.appendChild(row);
        });

        console.log(`Kalendar: Rendered ${this.filtered.length} events`);
    },

    /**
     * Update event counter display
     */
    updateCounter() {
        const counter = document.getElementById('event-count');
        if (counter) {
            counter.textContent = this.filtered.length;
        }
    },

    /**
     * Show/hide no results message
     */
    updateNoResults() {
        const noResults = document.getElementById('no-results');
        if (noResults) {
            if (this.filtered.length === 0 && (this.filters.categories.length > 0 || this.filters.searchText)) {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
            }
        }
    },

    /**
     * Bind event listeners to UI elements
     */
    bindEvents() {
        // Category checkboxes
        const checkboxes = document.querySelectorAll('.category-filter input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleCategoryChange(e.target);
            });
        });

        // Search input with debounce
        const searchInput = document.getElementById('kalendar-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
        }

        // Export button (will be fully implemented in Phase 6.7)
        const exportButton = document.getElementById('kalendar-export');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.exportToICal();
            });
        }

        // Clear filters button
        const clearButton = document.getElementById('clear-filters');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Filter header collapse (mobile)
        const filterHeader = document.querySelector('.filter-header');
        if (filterHeader) {
            filterHeader.addEventListener('click', () => {
                filterHeader.classList.toggle('collapsed');
            });
        }

        // Archive year selector
        const showArchivedBtn = document.getElementById('show-archived');
        if (showArchivedBtn) {
            showArchivedBtn.addEventListener('click', () => {
                const modal = document.getElementById('year-modal');
                if (modal) modal.style.display = 'flex';
            });
        }

        const closeModalBtn = document.getElementById('close-year-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                const modal = document.getElementById('year-modal');
                if (modal) modal.style.display = 'none';
            });
        }

        // Close modal on outside click
        const yearModal = document.getElementById('year-modal');
        if (yearModal) {
            yearModal.addEventListener('click', (e) => {
                if (e.target === yearModal) {
                    yearModal.style.display = 'none';
                }
            });
        }

        // Handle browser back/forward
        window.addEventListener('hashchange', () => {
            console.log('Kalendar: Hash changed');
            this.parseHash();
            this.initializeFilters();
            this.applyFilters();
            this.renderTable();
        });
    },

    /**
     * Handle category checkbox change
     */
    handleCategoryChange(checkbox) {
        const slug = checkbox.value;

        if (checkbox.checked) {
            // Add category to filters
            if (!this.filters.categories.includes(slug)) {
                this.filters.categories.push(slug);
            }
        } else {
            // Remove category from filters
            this.filters.categories = this.filters.categories.filter(c => c !== slug);
        }

        console.log('Kalendar: Categories changed:', this.filters.categories);

        // Update hash, apply filters, and re-render
        this.updateHash();
        this.applyFilters();
        this.renderTable();
    },

    /**
     * Handle search input with debounce
     */
    handleSearchInput(value) {
        // Clear existing timer
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
        }

        // Set new timer
        this.searchTimer = setTimeout(() => {
            this.filters.searchText = value.trim();
            console.log('Kalendar: Search text:', this.filters.searchText);

            this.applyFilters();
            this.renderTable();
        }, 300); // 300ms debounce
    },

    /**
     * Clear all filters
     */
    clearFilters() {
        // Uncheck all checkboxes
        const checkboxes = document.querySelectorAll('.category-filter input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear search input
        const searchInput = document.getElementById('kalendar-search');
        if (searchInput) {
            searchInput.value = '';
        }

        // Clear filter state
        this.filters.categories = [];
        this.filters.searchText = '';

        // Update hash, apply filters, and re-render
        this.updateHash();
        this.applyFilters();
        this.renderTable();

        console.log('Kalendar: Filters cleared');
    },

    /**
     * Export filtered events to iCal format (RFC 5545)
     * Creates a .ics file with currently filtered events
     */
    exportToICal() {
        console.log('Kalendar: Export to iCal requested');

        if (this.filtered.length === 0) {
            alert('Žádné akce k exportu. Zkuste upravit filtry.');
            return;
        }

        try {
            const icalContent = this.buildICalFile();
            this.downloadIcal(icalContent);
            console.log(`Kalendar: Successfully exported ${this.filtered.length} events`);
        } catch (error) {
            console.error('Kalendar: iCal export failed:', error);
            alert('Chyba při exportu kalendáře. Zkuste to prosím znovu.');
        }
    },

    /**
     * Build complete iCal file content
     * @returns {string} RFC 5545 compliant iCal content
     */
    buildICalFile() {
        let ical = this.buildIcalHeader();

        this.filtered.forEach(event => {
            ical += this.buildIcalEvent(event);
        });

        ical += 'END:VCALENDAR\r\n';

        return ical;
    },

    /**
     * Build iCal header
     * @returns {string} iCal header section
     */
    buildIcalHeader() {
        return [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Waldorfská škola Brno//Kalendář akcí//CS',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:Waldorf Brno - Akce',
            'X-WR-TIMEZONE:Europe/Prague',
            'X-WR-CALDESC:Kalendář akcí Waldorfské školy Brno',
            ''
        ].join('\r\n');
    },

    /**
     * Build iCal event (VEVENT)
     * @param {Object} event Event object
     * @returns {string} VEVENT section
     */
    buildIcalEvent(event) {
        const lines = ['BEGIN:VEVENT'];

        // UID - unique identifier
        lines.push(`UID:akce-${event.id}@waldorf-brno.cz`);

        // DTSTAMP - creation timestamp
        lines.push(`DTSTAMP:${this.formatIcalDateTime(new Date())}`);

        // DTSTART and DTEND - event dates
        if (event.dateMonth) {
            // Month-only event - use first and last day of month
            const [year, month] = event.dateMonth.split('-');
            const firstDay = new Date(year, month - 1, 1);
            const lastDay = new Date(year, month, 0); // Day 0 = last day of previous month

            lines.push(`DTSTART;VALUE=DATE:${this.formatIcalDate(firstDay)}`);
            lines.push(`DTEND;VALUE=DATE:${this.formatIcalDate(new Date(lastDay.getTime() + 86400000))}`); // +1 day for exclusive end
        } else if (event.dateFrom) {
            // Date range or single date
            const startDate = new Date(event.dateFrom * 1000);
            lines.push(`DTSTART;VALUE=DATE:${this.formatIcalDate(startDate)}`);

            if (event.dateTo && event.dateTo !== event.dateFrom) {
                const endDate = new Date(event.dateTo * 1000);
                // iCal end date is exclusive, so add 1 day
                endDate.setDate(endDate.getDate() + 1);
                lines.push(`DTEND;VALUE=DATE:${this.formatIcalDate(endDate)}`);
            } else {
                // Single day event - end date is next day
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 1);
                lines.push(`DTEND;VALUE=DATE:${this.formatIcalDate(endDate)}`);
            }
        }

        // SUMMARY - event title
        lines.push(`SUMMARY:${this.escapeIcal(event.title)}`);

        // DESCRIPTION - categories and location
        let description = '';
        if (event.categoryNames && event.categoryNames.length > 0) {
            description += 'Kategorie: ' + event.categoryNames.join(', ') + '\\n';
        }
        if (event.location) {
            description += 'Místo: ' + event.location;
        }
        if (description) {
            lines.push(`DESCRIPTION:${this.escapeIcal(description)}`);
        }

        // LOCATION
        if (event.location) {
            lines.push(`LOCATION:${this.escapeIcal(event.location)}`);
        }

        // CATEGORIES
        if (event.categoryNames && event.categoryNames.length > 0) {
            lines.push(`CATEGORIES:${event.categoryNames.map(c => this.escapeIcal(c)).join(',')}`);
        }

        // URL - link to event page (if event has content)
        if (event.hasLink && event.url) {
            lines.push(`URL:${event.url}`);
        }

        // STATUS
        lines.push('STATUS:CONFIRMED');

        // TRANSP - show as busy
        lines.push('TRANSP:OPAQUE');

        lines.push('END:VEVENT');
        lines.push('');

        return lines.join('\r\n');
    },

    /**
     * Format date for iCal DATE format (YYYYMMDD)
     * @param {Date} date JavaScript Date object
     * @returns {string} iCal date string
     */
    formatIcalDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    },

    /**
     * Format date-time for iCal DATETIME format (YYYYMMDDTHHmmssZ)
     * @param {Date} date JavaScript Date object
     * @returns {string} iCal datetime string in UTC
     */
    formatIcalDateTime(date) {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    },

    /**
     * Escape special characters for iCal format (RFC 5545)
     * @param {string} text Text to escape
     * @returns {string} Escaped text
     */
    escapeIcal(text) {
        if (!text) return '';

        return text
            .replace(/\\/g, '\\\\')   // Backslash
            .replace(/;/g, '\\;')     // Semicolon
            .replace(/,/g, '\\,')     // Comma
            .replace(/\n/g, '\\n')    // Newline
            .replace(/\r/g, '');      // Remove carriage return
    },

    /**
     * Trigger download of iCal file
     * @param {string} content iCal file content
     */
    downloadIcal(content) {
        // Create filename with current date and filter info
        const today = new Date();
        const dateStr = this.formatIcalDate(today);

        let filterStr = '';
        if (this.filters.categories.length > 0) {
            filterStr = '-' + this.filters.categories.slice(0, 2).join('-');
        }

        const filename = `waldorf-akce-${dateStr}${filterStr}.ics`;

        // Create blob and download link
        const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);

        console.log('Kalendar: Download triggered:', filename);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        KalendarApp.init();
    });
} else {
    // DOM is already ready
    KalendarApp.init();
}
