<?php

namespace Wpify\CustomFields;

use Closure;
use stdClass;
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

class CustomFields {
	public readonly Helpers $helpers;
	public readonly Api     $api;

	public function __construct() {
		$this->helpers = new Helpers();
		$this->api     = new Api( $this, $this->helpers );
	}

	public function create_options_page( array $args ): Options {
		return new Options( $args, $this );
	}

	public function create_metabox( array $args ): Metabox {
		return new Metabox( $args, $this );
	}

	public function create_taxonomy( array $args ): Taxonomy {
		return new Taxonomy( $args, $this );
	}

	public function create_product_options( array $args ): ProductOptions {
		return new ProductOptions( $args, $this );
	}

	public function create_product_variation_options( array $args ): ProductVariationOptions {
		return new ProductVariationOptions( $args, $this );
	}

	public function create_order_metabox( $args = array() ): OrderMetabox {
		return new OrderMetabox( $args, $this );
	}

	public function create_subscription_metabox( $args = array() ): SubscriptionMetabox {
		return new SubscriptionMetabox( $args, $this );
	}

	public function create_gutenberg_block( $args = array() ): GutenbergBlock {
		return new GutenbergBlock( $args, $this );
	}

	public function create_comment_metabox( $args = array() ): Comment {
		return new Comment( $args, $this );
	}

	public function create_site_options( $args = array() ): SiteOptions {
		return new SiteOptions( $args, $this );
	}

	public function create_user_options( array $array ): User {
		return new User( $array, $this );
	}

	public function create_membership_plan_options( $args = array() ): WcMembershipPlanOptions {
		return new WcMembershipPlanOptions( $args, $this );
	}

	public function create_woocommerce_settings( $args = array() ): WooCommerceSettings {
		return new WooCommerceSettings( $args, $this );
	}

	public function create_menu_item_options( $args = array() ): MenuItem {
		return new MenuItem( $args, $this );
	}

	public function get_js_asset( string $item ): array {
		$build_path = plugin_dir_path( __DIR__ ) . 'build/';
		$asset_php  = $build_path . $item . '.asset.php';

		if ( file_exists( $asset_php ) ) {
			$asset = require $asset_php;
		} else {
			$asset = array(
				'dependencies' => array(),
				'version'      => false,
			);
		}

		$asset['src'] = plugin_dir_url( __DIR__ ) . 'build/' . $item . '.js';

		return $asset;
	}

	public function get_css_asset( string $item ): array|string {
		$build_path = plugin_dir_path( __DIR__ ) . 'build/';
		$asset_php  = $build_path . $item . '.asset.php';

		if ( file_exists( $asset_php ) ) {
			$asset = require $asset_php;
		}

		$src = add_query_arg(
			'ver',
			$asset['version'],
			plugin_dir_url( __DIR__ ) . 'build/' . $item . '.css',
		);

		if ( file_exists( $build_path . 'style-' . $item . '.css' ) ) {
			$src = array(
				$src,
				add_query_arg(
					'ver',
					$asset['version'],
					plugin_dir_url( __DIR__ ) . 'build/style-' . $item . '.css',
				),
			);
		}

		return $src;
	}

	public function get_plugin_basename(): string {
		$basename = plugin_basename( __FILE__ );

		return substr( $basename, 0, strpos( $basename, '/' ) );
	}

	public function sanitize_item_value( array $item ): Closure {
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
			} elseif ( in_array( $item['type'], array( 'date', 'datetime', 'month', 'password', 'select', 'tel', 'text', 'time', 'week' ), true ) ) {
				$sanitized_value = sanitize_text_field( $value );
			} elseif ( 'email' === $item['type'] ) {
				$sanitized_value = sanitize_email( $value );
			} elseif ( 'group' === $item['type'] ) {
				$value           = is_string( $value ) ? json_decode( $value, true ) : (array) $value;
				$sanitized_value = array();
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

	public function sanitize_option_value( array $items = array() ): Closure {
		return function ( array $value = array() ) use ( $items ): array {
			$next_value = array();
			foreach ( $items as $item ) {
				$next_value[ $item['id'] ] = $this->sanitize_item_value( $item )( $value[ $item['id'] ] ?? null );
			}

			return $next_value;
		};
	}

	public function get_wp_type( array $item ): string {
		if ( in_array( $item['type'], array( 'attachment', 'post', 'term' ), true ) ) {
			$type = 'integer';
		} elseif ( in_array( $item['type'], array( 'number', 'range' ), true ) ) {
			$type = 'number';
		} elseif ( in_array( $item['type'], array( 'checkbox', 'toggle' ), true ) ) {
			$type = 'boolean';
		} elseif ( in_array( $item['type'], array( 'group', 'link', 'mapycz', 'multi_toggle', 'multi_checkbox' ), true ) ) {
			$type = 'object';
		} elseif ( str_starts_with( $item['type'], 'multi_' ) ) {
			$type = 'array';
		} else {
			$type = 'string';
		}

		return apply_filters( 'wpifycf_wp_type_' . $item['type'], $type, $item );
	}

	public function get_default_value( array $item ): mixed {
		$wp_type       = $this->get_wp_type( $item );
		$default_value = match ( $wp_type ) {
			'integer' => 0,
			'number' => 0.0,
			'boolean' => false,
			'array' => array(),
			'object' => new stdClass(),
			default => '',
		};

		return apply_filters( 'wpifycf_default_value_' . $item['type'], $default_value, $item );
	}
}
