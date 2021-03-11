<?php

namespace WpifyCustomFields;

use Exception;
use WpifyCustomFields\Managers\ApiManager;
use WpifyCustomFields\Managers\RepositoriesManager;
use WpifyCustomFieldsDeps\Wpify\Core\Abstracts\AbstractPlugin;
use WpifyCustomFieldsDeps\Wpify\Core\Exceptions\ContainerInvalidException;
use WpifyCustomFieldsDeps\Wpify\Core\Exceptions\ContainerNotExistsException;
use WpifyCustomFieldsDeps\Wpify\Core\Interfaces\RepositoryInterface;
use WpifyCustomFieldsDeps\Wpify\Core\WebpackManifest;
use WpifyCustomFieldsDeps\Wpify\Core\WordPressTemplate;

/**
 * Class Plugin
 *
 * @package Wpify
 */
class Plugin extends AbstractPlugin {
	/** Plugin version */
	public const VERSION = '1.0.0';

	/** Plugin slug name */
	public const PLUGIN_SLUG = 'wpify-custom-fields';

	/** Plugin namespace */
	public const PLUGIN_NAMESPACE = '\\' . __NAMESPACE__;

	/** @var RepositoriesManager */
	private $repositories_manager;

	/** @var ApiManager */
	private $api_manager;

	/** @var WebpackManifest */
	private $webpack_manifest;

	/** @var WordPressTemplate */
	private $template;

	/**
	 * Plugin constructor.
	 *
	 * @param RepositoriesManager $repositories_manager
	 * @param ApiManager $api_manager
	 * @param WebpackManifest $webpack_manifest
	 * @param WordPressTemplate $template
	 *
	 * @throws ContainerInvalidException
	 * @throws ContainerNotExistsException
	 */
	public function __construct(
		RepositoriesManager $repositories_manager,
		ApiManager $api_manager,
		WebpackManifest $webpack_manifest,
		WordPressTemplate $template
	) {
		$this->repositories_manager = $repositories_manager;
		$this->api_manager          = $api_manager;
		$this->webpack_manifest     = $webpack_manifest;
		$this->template             = $template;

		parent::__construct();

		add_filter( 'wpify_custom_fields_options_pages', function ( $repositories ) {
			$repositories[] = array(
				'page_title'  => 'Test page title',
				'menu_title'  => 'Test menu title',
				'menu_slug'   => 'test',
			);

			return $repositories;
		} );
	}

	public function setup() {
	}

	public function get_repositories_manager(): RepositoriesManager {
		return $this->repositories_manager;
	}

	/**
	 * @param string $class
	 *
	 * @return RepositoryInterface
	 */
	public function get_repository( string $class ) {
		return $this->repositories_manager->get_module( $class );
	}

	public function get_api_manager(): ApiManager {
		return $this->api_manager;
	}

	public function get_api( string $class ) {
		return $this->api_manager->get_module( $class );
	}

	/** @return WebpackManifest */
	public function get_webpack_manifest(): WebpackManifest {
		return $this->webpack_manifest;
	}

	/**
	 * Plugin activation and upgrade
	 *
	 * @param $network_wide
	 *
	 * @return void
	 */
	public function activate( $network_wide ) {
	}

	/**
	 * Plugin de-activation
	 *
	 * @param $network_wide
	 *
	 * @return void
	 */
	public function deactivate( $network_wide ) {
	}

	/**
	 * Plugin uninstall
	 *
	 * @return void
	 */
	public function uninstall() {
	}

	/**
	 * @return WordPressTemplate
	 */
	public function get_template(): WordPressTemplate {
		return $this->template;
	}

	/**
	 * Method to check if plugin has its dependencies. If not, it silently aborts
	 *
	 * @return bool
	 */
	protected function get_dependencies_exist() {
		return true;
	}

	/**
	 * @return bool
	 * @throws Exception
	 */
	protected function load_components() {
		// Conditionally lazy load components with $this->load()
	}
}
