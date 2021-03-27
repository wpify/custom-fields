<?php

namespace WpifyCustomFieldsPlugin;

use Exception;
use WPifyCustomFields\WpifyCustomFields;
use WpifyCustomFieldsPluginDeps\Wpify\Core\Abstracts\AbstractPlugin;
use WpifyCustomFieldsPluginDeps\Wpify\Core\Exceptions\ContainerInvalidException;
use WpifyCustomFieldsPluginDeps\Wpify\Core\Exceptions\ContainerNotExistsException;
use WpifyCustomFieldsPluginDeps\Wpify\Core\WebpackManifest;
use WpifyCustomFieldsPluginDeps\Wpify\Core\WordPressTemplate;

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


	/** @var WebpackManifest */
	private $webpack_manifest;

	/** @var WordPressTemplate */
	private $template;

	/** @var WpifyCustomFields */
	private $wcf;

	/**
	 * Plugin constructor.
	 *
	 * @param WebpackManifest $webpack_manifest
	 * @param WordPressTemplate $template
	 *
	 * @throws ContainerInvalidException
	 * @throws ContainerNotExistsException
	 */
	public function __construct(
		WebpackManifest $webpack_manifest,
		WordPressTemplate $template
	) {
		$this->webpack_manifest = $webpack_manifest;
		$this->template         = $template;
		$this->wcf              = get_wpify_custom_fields();

		parent::__construct();
	}

	public function setup() {
		$items = array(
			array(
				'type'        => 'text',
				'name'        => 'some_custom_field',
				'label'       => 'This is my custom field',
				'description' => 'This is some description of the field',
			),
			array(
				'type'  => 'url',
				'name'  => 'some_example_url',
				'label' => 'Example URL',
			),
			array(
				'type'  => 'email',
				'name'  => 'some_example_email',
				'label' => 'Example email',
			),
			array(
				'type'        => 'number',
				'name'        => 'some_example_number',
				'label'       => 'Example number',
				'min'         => 0,
				'max'         => 100,
				'placeholder' => 'Put some number here',
				'step'        => 0.2,
				'suffix'      => 'dollars',
			),
		);

		$this->wcf->add_options_page( array(
			'page_title' => 'Test page',
			'menu_title' => 'Test page',
			'menu_slug'  => 'test',
			'items'      => $items,
		) );

		$this->wcf->add_metabox( array(
			'id'         => 'test_meta_box',
			'title'      => 'Test Metabox',
			'items'      => $items,
			'post_types' => array( 'post', 'page' ),
		) );
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
