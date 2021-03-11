<?php

use WpifyCustomFields\Controllers\ButtonController;

get_header();
wpify_custom_fields_render(
	ButtonController::class,
	array(
		'label' => 'Some label',
		'link'  => 'https://wpify.io',
	)
);
wpify_custom_fields()->print_assets( 'some-module.css' );

while ( have_posts() ) {
	the_post();
	get_template_part( 'template-parts/content', get_post_type() );
}

get_footer();
