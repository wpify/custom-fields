<?php

get_header();

while ( have_posts() ) {
	the_post();

	if ( is_front_page() ) {
		get_template_part( 'template-parts/content-front-page' );
	} else {
		get_template_part( 'template-parts/content', get_post_type() );
	}
}

get_footer();
