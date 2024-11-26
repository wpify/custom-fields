<?php
/**
 * Class CustomFields.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields;

use Closure;
use stdClass;
use Wpify\CustomFields\exceptions\MissingArgumentException;
use Wpify\CustomFields\Integrations\Comment;
use Wpify\CustomFields\Integrations\GutenbergBlock;
use Wpify\CustomFields\Integrations\MenuItem;
use Wpify\CustomFields\Integrations\Metabox;
use Wpify\CustomFields\Integrations\Options;
use Wpify\CustomFields\Integrations\OrderMetabox;
use Wpify\CustomFields\Integrations\ProductOptions;
use Wpify\CustomFields\Integrations\ProductVariationOptions;
use Wpify\CustomFields\Integrations\SiteOptions;
use Wpify\CustomFields\Integrations\SubscriptionMetabox;
use Wpify\CustomFields\Integrations\Taxonomy;
use Wpify\CustomFields\Integrations\User;
use Wpify\CustomFields\Integrations\WcMembershipPlanOptions;
use Wpify\CustomFields\Integrations\WooCommerceSettings;

/**
 * Class CustomFields
 *
 * This class is responsible for managing various custom field creation and utility functions,
 * including options pages, metaboxes, taxonomies, product options, and other custom field functionalities.
 */
class CustomFields {
	/**
	 * Helpers class.
	 *
	 * @var Helpers
	 */
	public readonly Helpers $helpers;

	/**
	 * Api class.
	 *
	 * @var Api
	 */
	public readonly Api $api;

	/**
	 * Custom fields constructor.
	 */
	public function __construct() {
		$this->helpers = new Helpers();
		$this->api     = new Api( $this, $this->helpers );
	}

	/**
	 * Creates an options page.
	 *
	 * @param array $args The arguments to configure the options page.
	 *
	 * @return Options The created options page object.
	 * @throws MissingArgumentException Missing arguments.
	 */
	public function create_options_page( array $args ): Options {
		return new Options( $args, $this );
	}

	/**
	 * Creates a metabox with the given arguments.
	 *
	 * @param array $args The arguments for creating the metabox.
	 *
	 * @return Metabox The created Metabox instance.
	 */
	public function create_metabox( array $args ): Metabox {
		return new Metabox( $args, $this );
	}

	/**
	 * Creates custom fields in a taxonomy with the specified arguments.
	 *
	 * @param array $args The arguments to create the taxonomy.
	 *
	 * @return Taxonomy The created taxonomy instance.
	 * @throws MissingArgumentException Missing arguments.
	 */
	public function create_taxonomy_options( array $args ): Taxonomy {
		return new Taxonomy( $args, $this );
	}

	/**
	 * Creates custom fields in WooCommerce Product Options.
	 *
	 * @param array $args An associative array of arguments for configuring the product options.
	 *
	 * @return ProductOptions An instance of the ProductOptions class configured with the provided arguments.
	 * @throws MissingArgumentException Missing arguments.
	 */
	public function create_product_options( array $args ): ProductOptions {
		return new ProductOptions( $args, $this );
	}

	/**
	 * Creates custom fields in WooCommerce Product Variation based on the provided arguments.
	 *
	 * @param array $args An associative array of arguments for creating product variation options.
	 *
	 * @return ProductVariationOptions The created product variation options instance.
	 * @throws MissingArgumentException Missing arguments.
	 */
	public function create_product_variation_options( array $args ): ProductVariationOptions {
		return new ProductVariationOptions( $args, $this );
	}

	/**
	 * Creates custom fields in WooCommerce Order with the provided arguments.
	 *
	 * @param array $args Optional. An array of arguments to customize the OrderMetabox instance.
	 *
	 * @return OrderMetabox The created OrderMetabox instance.
	 * @throws MissingArgumentException Missing arguments.
	 */
	public function create_order_metabox( array $args ): OrderMetabox {
		return new OrderMetabox( $args, $this );
	}

	/**
	 * Creates a metabox in Woo Subscription.
	 *
	 * @param array $args Optional. Arguments to customize the subscription metabox. Default is an empty array.
	 *
	 * @return SubscriptionMetabox Returns an instance of the SubscriptionMetabox class.
	 * @throws MissingArgumentException Missing arguments.
	 */
	public function create_subscription_metabox( array $args ): SubscriptionMetabox {
		return new SubscriptionMetabox( $args, $this );
	}

	/**
	 * Creates a new Gutenberg block with custom fields.
	 *
	 * @param array $args Optional. Arguments to customize the Gutenberg block.
	 *
	 * @return GutenbergBlock The newly created Gutenberg block instance.
	 * @throws MissingArgumentException Missing arguments.
	 */
	public function create_gutenberg_block( array $args ): GutenbergBlock {
		return new GutenbergBlock( $args, $this );
	}

	/**
	 * Creates a comment metabox.
	 *
	 * @param array $args Optional. Arguments to initialize the comment metabox.
	 *
	 * @return Comment The created comment metabox.
	 */
	public function create_comment_metabox( array $args ): Comment {
		return new Comment( $args, $this );
	}

	/**
	 * Add custom fields to the site options.
	 *
	 * @param array $args An associative array of arguments necessary for creating site options.
	 *
	 * @return SiteOptions Returns an instance of the SiteOptions class initialized with the provided arguments.
	 * @throws MissingArgumentException Missing arguments.
	 */
	public function create_site_options( array $args ): SiteOptions {
		return new SiteOptions( $args, $this );
	}

	/**
	 * Add custom fields to the user edit screen.
	 *
	 * @param array $args An associative array of options for creating the user.
	 *
	 * @return User Returns a User object initialized with the provided options.
	 */
	public function create_user_options( array $args ): User {
		return new User( $args, $this );
	}

	/**
	 * Add custom fields to the Woo Membership plan options.
	 *
	 * @param array $args An array of arguments for creating the membership plan options.
	 *
	 * @return WcMembershipPlanOptions An instance of WcMembershipPlanOptions.
	 * @throws MissingArgumentException Missing arguments.
	 */
	public function create_membership_plan_options( array $args ): WcMembershipPlanOptions {
		return new WcMembershipPlanOptions( $args, $this );
	}

	/**
	 * Add custom fields to the WooCommerce settings screen.
	 *
	 * @param array $args Optional. An array of arguments to initialize the settings.
	 *
	 * @return WooCommerceSettings
	 */
	public function create_woocommerce_settings( array $args ): WooCommerceSettings {
		return new WooCommerceSettings( $args, $this );
	}

	/**
	 * Adds custom fields to the menu item.
	 *
	 * @param array $args An optional array of menu item options.
	 *
	 * @return MenuItem The newly created menu item.
	 */
	public function create_menu_item_options( array $args ): MenuItem {
		return new MenuItem( $args, $this );
	}

	/**
	 * Converts a path to a URL.
	 *
	 * @param string $path The path to convert.
	 *
	 * @return string The URL of the path.
	 */
	public function path_to_url( string $path ): string {
		$content_url = content_url();

		if ( is_ssl() && str_starts_with( $content_url, 'http://' ) ) {
			$content_url = str_replace( 'http://', 'https://', $content_url );
		}

		return str_replace( WP_CONTENT_DIR, $content_url, $path );
	}

	/**
	 * Get the path of the build file.
	 *
	 * @param string $file The file name.
	 *
	 * @return string
	 */
	public function get_build_path( string $file = '' ): string {
		return dirname( __DIR__ ) . '/build/' . $file;
	}

	/**
	 * Get the URL of the build file.
	 *
	 * @param string $file The file name.
	 *
	 * @return string
	 */
	public function get_build_url( string $file = '' ): string {
		return $this->path_to_url( $this->get_build_path( $file ) );
	}

	/**
	 * Get JavaScript asset details including its dependencies and version.
	 *
	 * @param string $item The name of the JavaScript file without the extension.
	 *
	 * @return array An associative array containing 'dependencies', 'version', and 'src' of the JavaScript asset.
	 */
	public function get_js_asset( string $item ): array {
		$asset_php = $this->get_build_path( $item . '.asset.php' );

		if ( file_exists( $asset_php ) ) {
			$asset = require $asset_php;
		} else {
			$asset = array(
				'dependencies' => array(),
				'version'      => false,
			);
		}

		$asset['src'] = $this->get_build_url( $item . '.js' );

		return $asset;
	}

	/**
	 * Retrieves the CSS asset for the specified item.
	 *
	 * @param string $item The name of the CSS item to retrieve.
	 *
	 * @return array|string URL(s) to the CSS asset(s) for the specified item. Returns an array if there are multiple versions, otherwise returns a string.
	 */
	public function get_css_asset( string $item ): array|string {
		$build_path = plugin_dir_path( __DIR__ ) . 'build/';
		$asset_php  = $this->get_build_path( $item . '.asset.php' );

		if ( file_exists( $asset_php ) ) {
			$asset = require $asset_php;
		}

		$src = ! empty( $asset )
			? add_query_arg(
				'ver',
				$asset['version'],
				$this->get_build_url( $item . '.css' ),
			)
			: $this->get_build_url( $item . '.css' );

		if ( ! empty( $asset ) && file_exists( $this->get_build_path( 'style-' . $item . '.css' ) ) ) {
			$src = array(
				$src,
				add_query_arg(
					'ver',
					$asset['version'],
					$this->get_build_url( 'style-' . $item . '.css' ),
				),
			);
		}

		return $src;
	}

	/**
	 * Retrieves the base name of the current implementation.
	 *
	 * @return string The base name of the current implementation.
	 */
	public function get_api_basename(): string {
		$content_path = str_replace( WP_CONTENT_DIR, '', __DIR__ );
		$file_path    = basename( $content_path );

		return ltrim( str_replace( '/' . $file_path, '', $content_path ), '/' );
	}

	/**
	 * Sanitizes a given item's value based on its type using a closure.
	 *
	 * @param array $item The item array which contains the type and other relevant information.
	 *
	 * @return Closure A closure that takes a value to be sanitized and returns the sanitized value.
	 */
	public function sanitize_item_value( array $item ): Closure {
		/**
		 * Sanitizes the value based on the specified item type.
		 *
		 * @param mixed $value The value to be sanitized.
		 *
		 * @return mixed The sanitized value.
		 */
		return function ( mixed $value ) use ( $item ): mixed {
			$original_value = $value;

			if ( in_array( $item['type'], array( 'attachment', 'post', 'term' ), true ) ) {
				$sanitized_value = absint( $value );
			} elseif ( in_array( $item['type'], array( 'checkbox', 'toggle' ), true ) ) {
				$sanitized_value = filter_var( $value, FILTER_VALIDATE_BOOLEAN );
			} elseif ( 'code' === $item['type'] ) {
				$sanitized_value = $value;
			} elseif ( 'color' === $item['type'] ) {
				$sanitized_value = sanitize_hex_color( $value );
			} elseif ( in_array(
				$item['type'],
				array(
					'date',
					'datetime',
					'month',
					'password',
					'select',
					'tel',
					'text',
					'time',
					'week',
				),
				true,
			) ) {
				$sanitized_value = sanitize_text_field( $value );
			} elseif ( 'email' === $item['type'] ) {
				$sanitized_value = sanitize_email( $value );
			} elseif ( 'group' === $item['type'] ) {
				$value           = is_string( $value ) ? json_decode( $value, true ) : (array) $value;
				$sanitized_value = $value;
				foreach ( $item['items'] as $sub_item ) {
					$sanitized_value[ $sub_item['id'] ] = $this->sanitize_item_value( $sub_item )( $value[ $sub_item['id'] ] ?? null );
				}
			} elseif ( 'link' === $item['type'] ) {
				$value                        = is_string( $value ) ? json_decode( $value, true ) : (array) $value;
				$sanitized_value              = array();
				$sanitized_value['post']      = absint( $value['post'] ?? 0 );
				$sanitized_value['label']     = sanitize_text_field( $value['label'] ?? '' );
				$sanitized_value['url']       = esc_url( $value['url'] ?? '' );
				$sanitized_value['target']    = sanitize_text_field( $value['target'] ?? '' );
				$sanitized_value['post_type'] = sanitize_text_field( $value['post_type'] ?? '' );
			} elseif ( 'mapycz' === $item['type'] ) {
				$value                        = is_string( $value ) ? json_decode( $value, true ) : (array) $value;
				$sanitized_value              = array();
				$sanitized_value['latitude']  = floatval( $value['latitude'] ?? 0 );
				$sanitized_value['longitude'] = floatval( $value['longitude'] ?? 0 );
				$sanitized_value['zoom']      = floatval( $value['zoom'] ?? 0 );
				$sanitized_value['street']    = sanitize_text_field( $value['street'] ?? '' );
				$sanitized_value['number']    = sanitize_text_field( $value['number'] ?? '' );
				$sanitized_value['zip']       = sanitize_text_field( $value['zip'] ?? '' );
				$sanitized_value['city']      = sanitize_text_field( $value['city'] ?? '' );
				$sanitized_value['cityPart']  = sanitize_text_field( $value['cityPart'] ?? '' );
				$sanitized_value['country']   = sanitize_text_field( $value['country'] ?? '' );
			} elseif ( in_array( $item['type'], array( 'number', 'range' ), true ) ) {
				$sanitized_value = floatval( $value );
			} elseif ( 'textarea' === $item['type'] ) {
				$sanitized_value = sanitize_textarea_field( $value );
			} elseif ( 'url' === $item['type'] ) {
				$sanitized_value = esc_url( $value );
			} elseif ( 'wysiwyg' === $item['type'] ) {
				$sanitized_value = wp_kses_post( $value );
			} elseif ( in_array( $item['type'], array( 'multi_checkbox', 'multi_toggle' ), true ) ) {
				$value           = is_string( $value ) ? json_decode( $value, true ) : (array) $value;
				$sanitized_value = array();

				if ( is_array( $value ) ) {
					foreach ( $value as $sub_value ) {
						$sanitized_value[] = sanitize_text_field( $sub_value );
					}
				}
			} elseif ( str_starts_with( $item['type'], 'multi_' ) ) {
				$single_type     = substr( $item['type'], strlen( 'multi_' ) );
				$value           = is_string( $value ) ? json_decode( $value, true ) : (array) $value;
				$sanitized_value = array();
				foreach ( $value as $sub_key => $sub_value ) {
					$sanitized_value[ $sub_key ] = $this->sanitize_item_value(
						array(
							...$item,
							'type' => $single_type,
						),
					)( $sub_value );
				}
			} else {
				$sanitized_value = sanitize_textarea_field( $value );
			}

			return apply_filters( 'wpifycf_sanitize_' . $item['type'], $sanitized_value, $original_value, $item );
		};
	}

	/**
	 * Generates and returns a closure that sanitizes an array of values based on the given items array.
	 *
	 * @param array $items An array of items. Each item should contain an 'id' key used
	 *                     for sanitizing the corresponding value in the input array.
	 * @param mixed $previous_value Optional. The previous value of the array. Default is an empty array.
	 *
	 * @return Closure A closure that accepts an array of values to be sanitized and returns the sanitized array.
	 */
	public function sanitize_option_value( array $items = array(), mixed $previous_value = array() ): Closure {
		return function ( array $value = array() ) use ( $items, $previous_value ): array {
			$next_value = is_array( $previous_value ) ? $previous_value : array();
			foreach ( $items as $item ) {
				if ( isset( $value[ $item['id'] ] ) ) {
					$next_value[ $item['id'] ] = $this->sanitize_item_value( $item )( $value[ $item['id'] ] );
				}
			}

			return $next_value;
		};
	}

	/**
	 * Determines the WordPress data type for a given item.
	 *
	 * This method categorizes items based on their 'type' field into several
	 * predefined WordPress data types.
	 *
	 * @param array $item The item array which contains a 'type' field.
	 *                    The 'type' field in the array determines the corresponding WordPress data type.
	 *
	 * @return string The WordPress data type which can be one of
	 *                'integer', 'number', 'boolean', 'object', 'array', or 'string'.
	 */
	public function get_wp_type( array $item ): string {
		if ( in_array( $item['type'], array( 'attachment', 'post', 'term' ), true ) ) {
			$type = 'integer';
		} elseif ( in_array( $item['type'], array( 'number', 'range' ), true ) ) {
			$type = 'number';
		} elseif ( in_array( $item['type'], array( 'checkbox', 'toggle' ), true ) ) {
			$type = 'boolean';
		} elseif ( in_array(
			$item['type'],
			array(
				'group',
				'link',
				'mapycz',
			),
			true,
		) ) {
			$type = 'object';
		} elseif ( str_starts_with( $item['type'], 'multi_' ) ) {
			$type = 'array';
		} else {
			$type = 'string';
		}

		return apply_filters( 'wpifycf_wp_type_' . $item['type'], $type, $item );
	}

	/**
	 * Retrieves the default value for a given item.
	 *
	 * @param array $item The item array which may contain a 'default' value.
	 *
	 * @return mixed The default value for the item.
	 */
	public function get_default_value( array $item ): mixed {
		if ( isset( $item['default'] ) ) {
			$default_value = $item['default'];
		} else {
			$wp_type       = $this->get_wp_type( $item );
			$default_value = match ( $wp_type ) {
				'integer' => 0,
				'number' => 0.0,
				'boolean' => false,
				'array' => array(),
				'object' => new stdClass(),
				default => '',
			};
		}

		return apply_filters( 'wpifycf_default_value_' . $item['type'], $default_value, $item );
	}
}
