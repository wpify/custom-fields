<?php

/**
 * Render a controller view
 *
 * @param $controller
 * @param array      $data
 * @param string     $view
 * @param bool       $return
 */
function wpify_custom_fields_render( $controller, $data = array(), $view = '', $return = false ) {
	wpify_custom_fields()->get_controller( $controller )->render( $data, $view, $return );
}

add_theme_support( 'editor-styles' );
add_editor_style( 'editor-style.css' );
