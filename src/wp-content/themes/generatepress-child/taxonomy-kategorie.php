<?php get_header(); ?>

<div id="main-content">
	<div class="container">
		<div id="content-area" class="clearfix">
			<div id="left-area">

		<?php
        $taxonomy = 'kategorie';
        $queried_term = get_query_var($taxonomy);
        $term = get_term_by( 'slug', $queried_term, $taxonomy );
       $paged = ( get_query_var('page') ) ? get_query_var('page') : 1;
        $dnes = strtotime(date('Y-m-d'));        
                
        $args = array(
            'post_type' => 'akce',
            'post_status' => 'publish',
            'posts_per_page' => 10,
            'paged' => $paged,
            'meta_key' => 'zv_datum_sort',
            'orderby' => 'meta_value_num',
            'order' => 'DESC',
            'tax_query' => array(
                array(
                    'taxonomy' => 'kategorie',
                    'field'    => 'term_id',
                    'terms'    => $term->term_id,
                ),
            ),
            'meta_query' => array(
                array(
                    'key' => 'zv_pryc',
                    'value' => $dnes,
                    'type' => 'numeric', // specify it for numeric values
                    'compare' => '<'
                )
            )
        );
                $the_query = new WP_Query( $args );
        if ( $the_query->have_posts() ) {
            while ( $the_query->have_posts() ) {
                $the_query->the_post();
             $html = '';    
                    $html .= '<div class="akce">';
                        $html .= '<div class="akce-thumb"><a href="' . get_the_permalink() . '">' . get_the_post_thumbnail( get_the_ID(), 'large', array() ) . '</a></div>';
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
			</div> <!-- #left-area -->

			<?php get_sidebar(); ?>
		</div> <!-- #content-area -->
	</div> <!-- .container -->
</div> <!-- #main-content -->

<?php

get_footer();
