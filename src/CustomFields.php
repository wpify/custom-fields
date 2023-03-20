<?php

namespace Wpify\CustomFields;

use Wpify\CustomFields\Implementations\AbstractImplementation;
use Wpify\CustomFields\Implementations\Comment;
use Wpify\CustomFields\Implementations\GutenbergBlock;
use Wpify\CustomFields\Implementations\Metabox;
use Wpify\CustomFields\Implementations\Options;
use Wpify\CustomFields\Implementations\ProductOptions;
use Wpify\CustomFields\Implementations\ProductVariationOptions;
use Wpify\CustomFields\Implementations\Taxonomy;
use Wpify\CustomFields\Implementations\User;
use Wpify\CustomFields\Implementations\WcMembershipPlanOptions;
use Wpify\CustomFields\Implementations\WooCommerceSettings;
use Wpify\CustomFields\Integrations\WPML;

/**
 * Class CustomFields
 * @package CustomFields
 */
final class CustomFields {
	/** @var Assets */
	private $assets;

	/** @var Sanitizer */
	private $sanitizer;

	/** @var Parser */
	private $parser;

	/** @var Api */
	private $api;

	/** @var callable[] */
	public $api_callbacks = array();

	/** @var AbstractImplementation[] */
	public $registered = array();

	/**
	 * CustomFields constructor.
	 */
	public function __construct( string $wcf_url = '' ) {
		$assets_path     = realpath( __DIR__ . '/../build' );
		$this->assets    = new Assets( $assets_path, $wcf_url );
		$this->sanitizer = new Sanitizer();
		$this->parser    = new Parser();
		$this->api       = new Api( $this );
	}

	/**
	 * @param array $args
	 *
	 * @return Options
	 */
	public function create_options_page( $args = array() ) {
		$options            = new Options( $args, $this );
		$this->registered[] = $options;

		return $options;
	}

	/**
	 * @param array $args
	 *
	 * @return Metabox
	 */
	public function create_metabox( $args = array() ) {
		$metabox            = new Metabox( $args, $this );
		$this->registered[] = $metabox;

		return $metabox;
	}

	/**
	 * @param array $args
	 *
	 * @return Comment
	 */
	public function create_comment_metabox( $args = array() ) {
		$metabox            = new Comment( $args, $this );
		$this->registered[] = $metabox;

		return $metabox;
	}

	/**
	 * @param array $args
	 *
	 * @return ProductOptions
	 */
	public function create_product_options( $args = array() ) {
		$product_options    = new ProductOptions( $args, $this );
		$this->registered[] = $product_options;

		return $product_options;
	}

	/**
	 * @param array $args
	 *
	 * @return ProductVariationOptions
	 */
	public function create_product_variation_options( $args = array() ) {
		$product_variation_options    = new ProductVariationOptions( $args, $this );
		$this->registered[] = $product_variation_options;

		return $product_variation_options;
	}

	/**
	 * @param array $args
	 *
	 * @return WcMembershipPlanOptions
	 */
	public function create_membership_plan_options( $args = array() ) {
		$membership_plan_options = new WcMembershipPlanOptions( $args, $this );
		$this->registered[]      = $membership_plan_options;

		return $membership_plan_options;
	}

	/**
	 * @param array $args
	 *
	 * @return Taxonomy
	 */
	public function create_taxonomy_options( $args = array() ) {
		$taxonomy           = new Taxonomy( $args, $this );
		$this->registered[] = $taxonomy;

		return $taxonomy;
	}

	/**
	 * @param array $args
	 *
	 * @return User
	 */
	public function create_user_options( $args = array() ) {
		$user               = new User( $args, $this );
		$this->registered[] = $user;

		return $user;
	}

	/**
	 * @param array $args
	 *
	 * @return WooCommerceSettings
	 */
	public function create_woocommerce_settings( $args = array() ) {
		$woocommerce_settings = new WooCommerceSettings( $args, $this );
		$this->registered[]   = $woocommerce_settings;

		return $woocommerce_settings;
	}

	/**
	 * @param array $args
	 *
	 * @return GutenbergBlock
	 */
	public function create_gutenberg_block( $args = array() ) {
		$gutenberg_block    = new GutenbergBlock( $args, $this );
		$this->registered[] = $gutenberg_block;

		return $gutenberg_block;
	}

	/**
	 * @return Parser
	 */
	public function get_parser(): Parser {
		return $this->parser;
	}

	/**
	 * @return Sanitizer
	 */
	public function get_sanitizer(): Sanitizer {
		return $this->sanitizer;
	}

	/**
	 * @return Api
	 */
	public function get_api(): Api {
		return $this->api;
	}

	/**
	 * @return Assets
	 */
	public function get_assets(): Assets {
		return $this->assets;
	}

	/**
	 * @param $id
	 * @param $callback
	 */
	public function set_api_callback( $id, $callback ) {
		$this->api_callbacks[ $id ] = $callback;
	}

	/**
	 * @param $id
	 *
	 * @return callable
	 */
	public function get_api_callback( $id ) {
		return $this->api_callbacks[ $id ] ?? null;
	}
}
