<?php get_header(); ?>
<?php
if ( function_exists('yoast_breadcrumb') ) {
  yoast_breadcrumb( '<p id="breadcrumbs">','</p>' );
}
?>
		<?php
			if ( have_posts() ) :
				while ( have_posts() ) : the_post();
					$post_format = et_pb_post_format(); ?>
<div id="main-content">
    <div class="et_pb_section et_pb_section_0 et_pb_with_background et_section_regular section_has_divider et_pb_bottom_divider" style="background-image: url(<?php echo esc_url( get_stylesheet_directory_uri() . '/images/waldorf-pozadi-web-small-2.jpg' ); ?>)!important;">
				
				
				
					<div class="et_pb_row et_pb_row_0">
				<div class="et_pb_column et_pb_column_4_4 et_pb_column_0    et_pb_css_mix_blend_mode_passthrough et-last-child">
				
				
				<div class="et_pb_with_border et_pb_module et_pb_text et_pb_text_0 et_pb_bg_layout_light  et_pb_text_align_left">
				
				
				<div class="et_pb_text_inner">
					<h1 style="text-align: center;" class="mujnadpis"><?php the_title();?></h1>
				</div>
			</div> <!-- .et_pb_text -->
			</div> <!-- .et_pb_column -->
				
				
			</div> <!-- .et_pb_row -->
				
				<div class="et_pb_bottom_inside_divider"></div>
			</div>
	<div class="container muj-cont">
		<div id="content-area" class="clearfix">

					<article id="post-<?php the_ID(); ?>" <?php post_class( 'et_pb_post mujpost' ); ?>>

				<div class="et_pb_column et_pb_column_4_4 et_pb_column_2    et_pb_css_mix_blend_mode_passthrough et-last-child">
				
				
				<div class="et_pb_module et_pb_text et_pb_text_2 et_pb_bg_layout_light  et_pb_text_align_left">
				
				
				<div class="et_pb_text_inner">
					<p class="akce-meta" style="text-align: left;"><span class="meta"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-calendar"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect> <line x1="16" y1="2" x2="16" y2="6"></line> <line x1="8" y1="2" x2="8" y2="6"></line> <line x1="3" y1="10" x2="21" y2="10"></line></svg></span><strong>&nbsp; &nbsp;<?php echo get_akce_date_display(get_the_ID());?></strong></p>
<p class="akce-meta" style="text-align: left;"><strong><span class="meta"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>&nbsp; &nbsp;<?php echo get_post_meta(get_the_ID(), 'zv_misto', true);?></strong></p>
				</div>
			</div> <!-- .et_pb_text --><div class="et_pb_module et_pb_image et_pb_image_0 et_always_center_on_mobile">
				
				
				<span class="et_pb_image_wrap "><?php echo get_the_post_thumbnail( get_the_ID(), 'large', array() );?></span>
			</div><div class="et_pb_module et_pb_text et_pb_text_3 et_pb_bg_layout_light  et_pb_text_align_left">
				
				
				<div class="et_pb_text_inner">
					<?php the_content(); ?>
				</div>
			</div> <!-- .et_pb_text -->
			</div>

					</article> <!-- .et_pb_post -->
		
		</div> <!-- #content-area -->
        
	</div> <!-- .container -->
</div> <!-- #main-content -->

			<?php
					endwhile;

					if ( function_exists( 'wp_pagenavi' ) )
						wp_pagenavi();
					else
						get_template_part( 'includes/navigation', 'index' );
				else :
					get_template_part( 'includes/no-results', 'index' );
				endif;
?>
<div id="main-content">
  <div class="container muj-cont2">  
<div class="et_pb_section et_pb_section_3 et_pb_with_background et_section_regular section_has_divider et_pb_bottom_divider et_pb_top_divider mujspodek">
				<div class="et_pb_button_module_wrapper et_pb_button_0_wrapper et_pb_button_alignment_center et_pb_module ">
				<a class="et_pb_button et_pb_button_0 et_pb_bg_layout_dark" href="/kalendar/" style="text-transform:uppercase;">Zpět na Kalendář akcí</a>
			</div>
			</div>
	</div> <!-- .container -->
</div> <!-- #main-content -->
<?php

get_footer();
