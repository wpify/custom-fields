<?php

/**
 * Template Name: Some example template
 * Template Post Type: page
 */

get_header();

while ( have_posts() ) {
	the_post();
	get_template_part( 'template-parts/content', get_post_type() );
}

get_footer();
