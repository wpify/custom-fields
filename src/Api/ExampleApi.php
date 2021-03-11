<?php

namespace WpifyCustomFields\Api;

use WP_REST_Response;
use WP_REST_Server;
use WpifyCustomFields\Plugin;
use WpifyCustomFieldsDeps\Wpify\Core\Abstracts\AbstractRest;

/**
 * @property Plugin $plugin
 */
class ExampleApi extends AbstractRest {

  /**
   * ExampleApi constructor.
   */
  public function __construct() {
  }

  public function setup() {
    add_action( 'rest_api_init', array( $this, 'register_routes' ) );
  }

  /**
   * Register the routes for the objects of the controller.
   */
  public function register_routes() {
    register_rest_route(
      $this->plugin->get_api_manager()->get_rest_namespace(),
      'some-endpoint',
      array(
        array(
          'methods'  => WP_REST_Server::CREATABLE,
          'callback' => array( $this, 'handle_some_endpoint' ),
          'args'     => array(
            'size' => array(
              'required' => true,
            ),
          ),
        ),
      )
    );

    register_rest_route(
      $this->plugin->get_api_manager()->get_rest_namespace(),
      '/set-app-name',
      array(
        'methods'  => WP_REST_Server::EDITABLE,
        'callback' => array( $this, 'set_app_name' ),
        'args'     => array(
          'nonce' => array(
            'required'          => true,
            'validate_callback' => function ( $nonce ) {
              return wp_verify_nonce( $nonce, $this->plugin->get_api_manager()->get_nonce_action() );
            },
          ),
          'name'  => array(
            'required' => true,
          ),
        ),
      )
    );
  }

  /**
   * Add box to cart
   *
   * @param \WP_REST_Request $request Full data about the request.
   *
   * @return \WP_Error|\WP_REST_Request|\WP_REST_Response | bool
   */
  public function handle_some_endpoint( $request ) {
    $size = $request->get_param( 'size' );

    return new WP_REST_Response( array( 'size' => $size ), 201 );
  }

  public function set_app_name( $request ) {
    $params = $request->get_params();

    set_transient( 'wpify_app_name', $params['name'] );

    return rest_ensure_response( $params );
  }


  /**
   * Check if a given request has access to create items
   *
   * @param \WP_REST_Request $request Full data about the request.
   *
   * @return \WP_Error|bool
   */
  public function create_item_permissions_check( $request ) {
    return true;
  }


  /**
   * Prepare the item for the REST response
   *
   * @param mixed $item WordPress representation of the item.
   * @param \WP_REST_Request $request Request object.
   *
   * @return mixed
   */
  public function prepare_item_for_response( $item, $request ) {
    return array();
  }
}
