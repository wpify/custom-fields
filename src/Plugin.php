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
		parent::__construct();

		$this->webpack_manifest = $webpack_manifest;
		$this->template         = $template;
		$this->wcf              = get_wpify_custom_fields();
	}

	public function setup() {
		$items = array(
			array(
				'type'        => 'title',
				'title'       => 'Some title',
				'description' => 'Some description',
			),
			array(
				'type'        => 'text',
				'name'        => 'some_custom_field',
				'title'       => 'This is my custom field',
				'description' => 'This is some description of the field',
			),
			array(
				'type'  => 'url',
				'name'  => 'some_example_url',
				'title' => 'Example URL',
			),
			array(
				'type'  => 'email',
				'name'  => 'some_example_email',
				'title' => 'Example email',
			),
			array(
				'type'  => 'tel',
				'name'  => 'some_example_tel',
				'title' => 'Example tel',
			),
			array(
				'type'              => 'number',
				'name'              => 'some_example_number',
				'title'             => 'Example number',
				'custom_attributes' => array(
					'min'  => 0,
					'max'  => 100,
					'step' => 0.2,
				),
				'placeholder'       => 'Put some number here',
				'suffix'            => 'dollars',
			),
			array(
				'type'  => 'password',
				'name'  => 'some_example_password',
				'title' => 'Example password',
			),
			array(
				'type'  => 'color',
				'name'  => 'some_example_color',
				'title' => 'Example color',
			),
			array(
				'type'  => 'datetime',
				'name'  => 'some_example_datetime',
				'title' => 'Example datetime',
			),
			array(
				'type'  => 'week',
				'name'  => 'some_example_week',
				'title' => 'Example week',
			),
			array(
				'type'  => 'month',
				'name'  => 'some_example_month',
				'title' => 'Example month',
			),
			array(
				'type'  => 'date',
				'name'  => 'some_example_date',
				'title' => 'Example date',
			),
			array(
				'type'  => 'time',
				'name'  => 'some_example_time',
				'title' => 'Example time',
			),
			array(
				'type'  => 'textarea',
				'name'  => 'some_example_textarea',
				'title' => 'Example textarea',
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

		$this->wcf->add_product_options( array(
			'tab'   => array( 'id' => 'custom', 'label' => 'Custom' ),
			'items' => $items,
		) );

		$this->wcf->add_taxonomy_options( array(
			'taxonomy' => 'category',
			'items'    => $items,
		) );

		$this->wcf->add_woocommerce_settings( array(
			'tab'     => array( 'id' => 'wpify-woo', 'label' => 'Custom' ),
			'section' => array( 'id' => '', 'label' => 'General' ),
			'items'   => $items,
		) );

		$this->wcf->add_woocommerce_settings( array(
			'tab'     => array( 'id' => 'wpify-woo', 'label' => 'Custom' ),
			'section' => array( 'id' => 'wpify-woo', 'label' => 'Custom' ),
			'items'   => $items,
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
