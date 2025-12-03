<?php get_header(); ?>
<?php
if ( function_exists('yoast_breadcrumb') ) {
  yoast_breadcrumb( '<p id="breadcrumbs">','</p>' );
}
?>
	<div id="page-container">
<?php
	if ( is_page_template( 'page-template-blank.php' ) ) {
		return;
	}

	$et_secondary_nav_items = et_divi_get_top_nav_items();

	$et_phone_number = $et_secondary_nav_items->phone_number;

	$et_email = $et_secondary_nav_items->email;

	$et_contact_info_defined = $et_secondary_nav_items->contact_info_defined;

	$show_header_social_icons = $et_secondary_nav_items->show_header_social_icons;

	$et_secondary_nav = $et_secondary_nav_items->secondary_nav;

	$et_top_info_defined = $et_secondary_nav_items->top_info_defined;

	$et_slide_header = 'slide' === et_get_option( 'header_style', 'left' ) || 'fullscreen' === et_get_option( 'header_style', 'left' ) ? true : false;
?>

<--! <div id="main-content"> !-->
        <div class="et_pb_section et_pb_section_0 et_pb_with_background et_section_regular section_has_divider et_pb_bottom_divider" style="background-image: url(<?php echo esc_url( get_stylesheet_directory_uri() . '/images/waldorf-pozadi-web-small-2.jpg' ); ?>)!important;">
				
				
				
				
					<div class="et_pb_row et_pb_row_0">
				<div class="et_pb_column et_pb_column_4_4 et_pb_column_0    et_pb_css_mix_blend_mode_passthrough et-last-child">
				
				
				<div class="et_pb_with_border et_pb_module et_pb_text et_pb_text_0 et_pb_bg_layout_light  et_pb_text_align_left">
				
				
				<div class="et_pb_text_inner">
					<h1 style="text-align: center;" class="mujnadpis">Archiv akcí</h1>
				</div>
			</div> <!-- .et_pb_text -->
			</div> <!-- .et_pb_column -->
				
				
			</div> <!-- .et_pb_row -->
				
				<div class="et_pb_bottom_inside_divider"></div>
			</div>
	<div class="container muj-cont">
		<div id="content-area" class="clearfix">
		<?php
         $paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
global $query;
  //pagination fixes prior to loop
  $temp =  $query;
            
  $query = null;
        $dnes = strtotime(date('Y-m-d'));        
                
        $args = array(
            'post_type' => 'akce',
            'post_status' => 'publish',
            'posts_per_page' => get_option( 'posts_per_page' ),
            'paged' => $paged,
            'meta_key' => 'zv_datum_sort',
            'orderby' => 'meta_value_num',
            'order' => 'DESC',
            'meta_query' => array(
                array(
                    'key' => 'zv_pryc',
                    'value' => $dnes,
                    'type' => 'numeric', // specify it for numeric values
                    'compare' => '<'
                )
            )
        );
                query_posts( $args );
        if ( have_posts() ) {
            while ( have_posts() ) {
                the_post();
             $html = '';    
                    $html .= '<div class="akce">';
                        $html .= '<div class="akce-thumb"><a href="' . get_the_permalink() . '">' . get_the_post_thumbnail( get_the_ID(), 'akce', array() ) . '</a></div>';
                        $html .= '<div class="akce-cont">';
                            $html .= '<h2><a href="' . get_the_permalink() . '">' . get_the_title() . '</a></h2>';
                            $html .= '<p class="akce-meta">';
                                $html .= '<span class="meta"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-calendar"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span>' . get_akce_date_display(get_the_ID());
                                $html .= '<span class="meta"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>' . get_post_meta(get_the_ID(), 'zv_misto', true);
                            $html .= '</p>';
                            $html .= '<p>' . get_the_excerpt() . '</p>';
                        $html .= '</div>';
                    $html .= '</div>';
                    echo $html;
                    
            }

					if ( function_exists( 'wp_pagenavi' ) )
						wp_pagenavi();
					else
						get_template_part( 'includes/navigation', 'index' );
        }else{
            get_template_part( 'includes/no-results', 'index' );
        }
			?>
            <div class="et_pb_section et_pb_section_2 et_section_regular">
				<div class="et_pb_row et_pb_row_2 et_pb_row_4col" style="width:100%;margin:0px;">
				<div class="et_pb_column et_pb_column_1_4 et_pb_column_2    et_pb_css_mix_blend_mode_passthrough">
				
				
				<div class="et_pb_module et_pb_image et_pb_image_0 et_always_center_on_mobile">
				
				
				<span class="et_pb_image_wrap "><img src="<?php echo esc_url( get_stylesheet_directory_uri() . '/images/waldorfska-skola-brno_color_200px.png' ); ?>" alt="Waldorfská škola Brno"></span>
			</div><div class="et_pb_with_border et_pb_module et_pb_text et_pb_text_2 et_pb_bg_layout_light  et_pb_text_align_left">
				
			<!--	
				<div class="et_pb_text_inner">
					 Kalendář akcí Aktuality Fotogalerie Kontakty 
				</div>-->
			</div> <!-- .et_pb_text 
			</div> <!-- .et_pb_column --><div class="et_pb_column et_pb_column_1_4 et_pb_column_3    et_pb_css_mix_blend_mode_passthrough">
				
				
				<div class="et_pb_module et_pb_text et_pb_text_3 et_pb_bg_layout_light  et_pb_text_align_left">
				
				
				<div class="et_pb_text_inner">
					<h3>Základní škola</h3>
<p>O škole Učitelé Školní družina Školní klub Stravování Stránky tříd Zápis do 1. třídy ZŠ Dokumenty základní školy 
				</p></div>
			</div> <!-- .et_pb_text -->
			</div> <!-- .et_pb_column --><div class="et_pb_column et_pb_column_1_4 et_pb_column_4    et_pb_css_mix_blend_mode_passthrough">
				
				
				<div class="et_pb_module et_pb_text et_pb_text_4 et_pb_bg_layout_light  et_pb_text_align_left">
				
				
				<div class="et_pb_text_inner">
					<h3><strong>MATEŘSKÁ ŠKOLA</strong></h3>
<p>O školce Učitelé Stravování Zápis do MŠ Dokumenty mateřské školy 
				</p></div>
			</div> <!-- .et_pb_text -->
			</div> <!-- .et_pb_column --><div class="et_pb_column et_pb_column_1_4 et_pb_column_5    et_pb_css_mix_blend_mode_passthrough">
				
				
				<div class="et_pb_module et_pb_text et_pb_text_5 et_pb_bg_layout_light  et_pb_text_align_left">
				
				
				<div class="et_pb_text_inner">
					<h3><strong>MRAWENIŠTĚ</strong></h3>
<p>Zájmové kroužky Kruh rodičů W alternativa Páteční listy Projekty Odkazy 
				</p></div>
			</div> <!-- .et_pb_text -->
			</div> <!-- .et_pb_column -->
				
				
			</div> <!-- .et_pb_row -->
				
				
			</div>
		</div> <!-- #content-area -->
	</div> <!-- .container -->
</div> <!-- #main-content -->

<?php
$query = null; $query = $temp;
get_footer();
