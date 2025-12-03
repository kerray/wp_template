<?php

/**
 * Custom shortcode to display Real Media Library folder contents as a list
 * Usage: [rml_file_list folder="123" filter="*.pdf,*.txt"]
 */

function rml_file_list_shortcode($atts)
{
	// Parse shortcode attributes
	$atts = shortcode_atts(array(
		'folder' => '',
		'filter' => '',
		'class' => 'rml-file-list',
		'show_icon' => 'yes'
	), $atts, 'rml_file_list');

	// Check if folder ID is provided
	if (empty($atts['folder'])) {
		return '<p>Please provide a folder ID.</p>';
	}

	// Check if Real Media Library is active
	if (!function_exists('wp_rml_get_object_by_id')) {
		return '<p>Real Media Library is not active.</p>';
	}

	// Get the folder object
	$folder = wp_rml_get_object_by_id($atts['folder']);

	if (!$folder) {
		return '<p>Folder not found.</p>';
	}

	// Get files from the folder
	$args = array(
		'post_type' => 'attachment',
		'post_status' => 'inherit',
		'posts_per_page' => -1,
		'orderby' => 'title',
		'order' => 'ASC',
		'rml_folder' => $atts['folder']
	);

	$attachments = get_posts($args);

	if (empty($attachments)) {
		return '<p>No files found in this folder.</p>';
	}

	// Process filter if provided
	$allowed_extensions = array();
	if (!empty($atts['filter'])) {
		$filters = explode(',', $atts['filter']);
		foreach ($filters as $filter) {
			// Remove * and . to get clean extension
			$ext = str_replace(array('*', '.'), '', trim($filter));
			$allowed_extensions[] = strtolower($ext);
		}
	}

	// Start building output
	$output = '<div class="' . esc_attr($atts['class']) . '">';
	$output .= '<ul class="rml-file-items">';

	$has_files = false;

	foreach ($attachments as $attachment) {
		// Get file URL and path
		$file_url = wp_get_attachment_url($attachment->ID);
		$file_path = get_attached_file($attachment->ID);

		// Check file extension if filter is applied
		if (!empty($allowed_extensions)) {
			$file_extension = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));
			if (!in_array($file_extension, $allowed_extensions)) {
				continue;
			}
		}

		$has_files = true;

		// Get file metadata
		$title = get_the_title($attachment->ID);
		$description = $attachment->post_content; // Description field
		$caption = $attachment->post_excerpt; // Caption field

		// Use filename if title is empty
		if (empty($title)) {
			$title = basename($file_path);
		}

		// Get file type for icon class
		$mime_type = get_post_mime_type($attachment->ID);
		$file_type_class = 'file-default';

		if (strpos($mime_type, 'pdf') !== false) {
			$file_type_class = 'file-pdf';
		} elseif (strpos($mime_type, 'text') !== false) {
			$file_type_class = 'file-text';
		} elseif (strpos($mime_type, 'word') !== false || strpos($mime_type, 'document') !== false) {
			$file_type_class = 'file-doc';
		} elseif (strpos($mime_type, 'sheet') !== false || strpos($mime_type, 'excel') !== false) {
			$file_type_class = 'file-excel';
		} elseif (strpos($mime_type, 'image') !== false) {
			$file_type_class = 'file-image';
		} elseif (strpos($mime_type, 'video') !== false) {
			$file_type_class = 'file-video';
		} elseif (strpos($mime_type, 'audio') !== false) {
			$file_type_class = 'file-audio';
		} elseif (strpos($mime_type, 'zip') !== false || strpos($mime_type, 'archive') !== false) {
			$file_type_class = 'file-archive';
		}

		// Build list item
		$output .= '<li class="rml-file-item ' . esc_attr($file_type_class) . '">';

		// Add icon if enabled
		if ($atts['show_icon'] === 'yes') {
			$output .= '<span class="rml-file-icon" aria-hidden="true"></span>';
		}

		$output .= '<div class="rml-file-content">';

		// File link
		$output .= '<a href="' . esc_url($file_url) . '" target="_blank" class="rml-file-link">';
		$output .= esc_html($title);
		$output .= '</a>';

		// Description
		if (!empty($description)) {
			$output .= '<div class="rml-file-description">' . wp_kses_post($description) . '</div>';
		}

		$output .= '</div>'; // .rml-file-content
		$output .= '</li>';
	}

	$output .= '</ul>';
	$output .= '</div>';

	if (!$has_files) {
		return '<p>No files matching the filter criteria found in this folder.</p>';
	}

	return $output;
}
add_shortcode('rml_file_list', 'rml_file_list_shortcode');

/**
 * Add basic CSS for the file list
 * You can customize this or move it to your theme's CSS file
 */
function rml_file_list_styles()
{
?>
	<style>
		.rml-file-list {
			margin: 20px 0;
		}

		.rml-file-list ul.rml-file-items {
			list-style: none;
			padding: 0;
			margin: 0;
		}

		.rml-file-list .rml-file-item {
			margin-bottom: 20px;
			padding: 15px;
			background: #f9f9f9;
			border-left: 3px solid #0073aa;
			display: flex;
			align-items: flex-start;
		}

		.rml-file-list .rml-file-icon {
			display: inline-block;
			width: 24px;
			height: 24px;
			margin-right: 12px;
			flex-shrink: 0;
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center;
		}

		/* File type icons - using dashicons */
		.rml-file-list .file-pdf .rml-file-icon::before {
			content: "\f123";
			font-family: dashicons;
			font-size: 24px;
			color: #dc3232;
		}

		.rml-file-list .file-text .rml-file-icon::before {
			content: "\f123";
			font-family: dashicons;
			font-size: 24px;
			color: #666;
		}

		.rml-file-list .file-doc .rml-file-icon::before {
			content: "\f123";
			font-family: dashicons;
			font-size: 24px;
			color: #2b5797;
		}

		.rml-file-list .file-excel .rml-file-icon::before {
			content: "\f123";
			font-family: dashicons;
			font-size: 24px;
			color: #1e7145;
		}

		.rml-file-list .file-image .rml-file-icon::before {
			content: "\f128";
			font-family: dashicons;
			font-size: 24px;
			color: #82878c;
		}

		.rml-file-list .file-video .rml-file-icon::before {
			content: "\f126";
			font-family: dashicons;
			font-size: 24px;
			color: #82878c;
		}

		.rml-file-list .file-audio .rml-file-icon::before {
			content: "\f127";
			font-family: dashicons;
			font-size: 24px;
			color: #82878c;
		}

		.rml-file-list .file-archive .rml-file-icon::before {
			content: "\f506";
			font-family: dashicons;
			font-size: 24px;
			color: #82878c;
		}

		.rml-file-list .file-default .rml-file-icon::before {
			content: "\f123";
			font-family: dashicons;
			font-size: 24px;
			color: #82878c;
		}

		.rml-file-list .rml-file-content {
			flex: 1;
		}

		.rml-file-list .rml-file-link {
			font-weight: 600;
			font-size: 16px;
			text-decoration: none;
			color: #0073aa;
			display: block;
			margin-bottom: 5px;
		}

		.rml-file-list .rml-file-link:hover {
			color: #005177;
			text-decoration: underline;
		}

		.rml-file-list .rml-file-description {
			color: #666;
			font-size: 14px;
			line-height: 1.5;
			margin-top: 5px;
		}
	</style>
<?php
}
add_action('wp_head', 'rml_file_list_styles');
