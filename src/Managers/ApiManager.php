<?php

namespace WpifyCustomFields\Managers;

use WpifyCustomFields\Api\ExampleApi;
use WpifyCustomFields\Plugin;
use WpifyCustomFieldsDeps\Wpify\Core\Abstracts\AbstractManager;

/**
 * Class ApiManager
 *
 * @package WpifyCustomFields\Managers
 * @property Plugin $plugin
 */
class ApiManager extends AbstractManager {

  public const REST_NAMESPACE = 'wpify-custom-fields/v1';
  public const NONCE_ACTION = 'wp_rest';

  protected $modules = array(
  );

  public function get_rest_url() {
    return rest_url( $this->get_rest_namespace() );
  }

  public function get_rest_namespace() {
    return $this::REST_NAMESPACE;
  }

  public function get_nonce_action() {
    return $this::NONCE_ACTION;
  }

  public function setup() {
  }
}
