<!--
/**
 * Kalendar Template - Filterable Events Calendar
 *
 * Displays all upcoming events with client-side filtering by category,
 * text search, and iCal export functionality.
 *
 * Data loaded via PHP and passed to JavaScript:
 * - AKCE_DATA: Array of event objects
 * - AKCE_CATEGORIES: Array of category objects with colors
 * - KALENDAR_SETTINGS: mode, limit, days settings
 *
 * JavaScript handles:
 * - URL hash state management
 * - Client-side filtering
 * - Table rendering
 * - iCal export generation
 *
 * Modes:
 * - 'full': Full calendar with all events and expanded filters
 * - 'upcoming': Only future events, collapsed filters, optional limit
 */
-->
<?php
// Get settings from shortcode (with defaults)
$mode = isset($kalendar_settings['mode']) ? $kalendar_settings['mode'] : 'full';
$limit = isset($kalendar_settings['limit']) ? $kalendar_settings['limit'] : 0;
$days = isset($kalendar_settings['days']) ? $kalendar_settings['days'] : 60;
$is_upcoming = ($mode === 'upcoming');
?>

<div class="kalendar-container<?php echo $is_upcoming ? ' kalendar-upcoming' : ''; ?>" data-mode="<?php echo esc_attr($mode); ?>" data-limit="<?php echo esc_attr($limit); ?>" data-days="<?php echo esc_attr($days); ?>">
    <!-- Filter Section -->
    <div class="kalendar-filters">
        <h3 class="filter-header<?php echo $is_upcoming ? ' collapsed' : ''; ?>">
            <span class="filter-toggle">▼</span> Filtry
        </h3>

        <div class="filter-content">
            <!-- Category Checkboxes -->
            <div class="filter-categories">
                <?php
                $categories = get_akce_category_data();
                foreach ($categories as $category) :
                    $color = esc_attr($category['color']);
                    $slug = esc_attr($category['slug']);
                    $name = esc_html($category['name']);
                ?>
                    <label class="category-filter">
                        <input
                            type="checkbox"
                            name="kategorie"
                            value="<?php echo $slug; ?>"
                            data-color="<?php echo $color; ?>"
                        >
                        <span class="category-badge" style="background-color: <?php echo $color; ?>">
                            <?php echo $name; ?>
                        </span>
                    </label>
                <?php endforeach; ?>
            </div>

            <!-- Search and Export -->
            <div class="filter-actions">
                <div class="search-box">
                    <input
                        type="text"
                        id="kalendar-search"
                        placeholder="🔍 Hledat v názvech..."
                        aria-label="Hledat akce podle názvu"
                    >
                </div>
                <button id="kalendar-export" class="export-button" aria-label="Stáhnout kalendář jako iCal">
                    📅 Stáhnout iCal
                </button>
            </div>
        </div>
    </div>

    <!-- Event Counter and Today Marker -->
    <div class="kalendar-status">
        <div class="event-counter">
            Zobrazeno: <strong id="event-count">0</strong> akcí
        </div>
        <?php if (!isset($_GET['year'])) : ?>
            <div class="today-marker" style="display: none;">
                <span class="marker-dot">●</span> Dnes
            </div>
        <?php endif; ?>
    </div>

    <!-- Events Table -->
    <div class="kalendar-table-wrapper">
        <table class="kalendar-table">
            <thead>
                <tr>
                    <th class="col-title">Název</th>
                    <th class="col-date">Datum</th>
                    <th class="col-categories">Kategorie</th>
                </tr>
            </thead>
            <tbody id="kalendar-tbody">
                <!-- Events will be rendered here by JavaScript -->
                <tr class="loading-row">
                    <td colspan="3">Načítám akce...</td>
                </tr>
            </tbody>
        </table>
    </div>

    <?php if ($is_upcoming) : ?>
        <!-- Link to full calendar (for upcoming mode) -->
        <div class="kalendar-full-link">
            <a href="/kalendar/" class="view-full-calendar">
                📅 Zobrazit celý kalendář →
            </a>
        </div>
    <?php else : ?>
        <!-- Archive Notice (shown when viewing archived school year) -->
        <?php if (isset($_GET['schoolyear'])) :
            $sy = parse_school_year(sanitize_text_field($_GET['schoolyear']));
        ?>
            <div class="archived-notice">
                <p>
                    📦 Zobrazujete akce ze školního roku <strong><?php echo esc_html(format_school_year($sy['start'], $sy['end'])); ?></strong>
                    <br>
                    <a href="<?php echo esc_url(remove_query_arg('schoolyear')); ?>" class="back-to-current">
                        ← Zpět na aktuální akce
                    </a>
                </p>
            </div>
        <?php else : ?>
            <!-- Archive Year Selector -->
            <div class="archived-selector">
                <button id="show-archived" class="archived-button">
                    📦 Zobrazit akce z minulých školních roků
                </button>

                <div id="year-modal" class="year-modal" style="display: none;">
                    <div class="year-modal-content">
                        <h3>Vyberte školní rok</h3>
                        <div class="year-list">
                            <?php
                            $current = get_current_school_year();
                            for ($i = 1; $i <= 10; $i++) :
                                $start = $current['start'] - $i;
                                $end = $start + 1;
                                $sy_str = format_school_year($start, $end);
                            ?>
                                <a href="<?php echo esc_url(add_query_arg('schoolyear', $sy_str)); ?>" class="year-link">
                                    <?php echo esc_html($sy_str); ?>
                                </a>
                            <?php endfor; ?>
                        </div>
                        <button id="close-year-modal" class="close-modal">Zavřít</button>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    <?php endif; ?>

    <!-- No Results Message (shown by JavaScript when no events match filters) -->
    <div id="no-results" class="no-results" style="display: none;">
        <p>Žádné akce neodpovídají vybraným filtrům.</p>
        <button id="clear-filters" class="clear-filters-button">Vymazat filtry</button>
    </div>
</div>
