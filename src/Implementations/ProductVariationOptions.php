<?php

namespace Wpify\CustomFields\Implementations;

use WP_Screen;
use Wpify\CustomFields\CustomFields;

/**
 * Class ProductOptions
 * @package CustomFields\Implementations
 */
final class ProductVariationOptions extends AbstractPostImplementation {
	/** @var int */
	private $product_variation_id;

	/** @var string */
	private $after;

	/** @var array */
	private $items;

	/** @var callable */
	private $display;

	/**
	 * ProductOptions constructor.
	 *
	 * @param array $args
	 * @param CustomFields $wcf
	 */
	public function __construct( array $args, CustomFields $wcf ) {
		parent::__construct( $args, $wcf );

		$args = wp_parse_args( $args, array(
			'after'         => 'pricing',
			'items'         => array(),
			'init_priority' => 10,
			'display'       => function () {
				return true;
			},
		) );

		if ( is_callable( $args['display'] ) ) {
			$this->display = $args['display'];
		} else {
			$this->display = function () use ( $args ) {
				return $args['display'];
			};
		}

		$this->items = $this->prepare_items( $args['items'] );

		if ( empty( $this->after ) ) {
			$this->after = 'pricing';
		}

		if ( in_array( $this->after, array( 'pricing', 'inventory', 'dimensions', 'download' ) ) ) {
			add_action( 'woocommerce_variation_options_' . $this->after, array( $this, 'render_custom_fields' ), 10, 3 );
		} else {
			add_action( 'woocommerce_product_after_variable_attributes', array( $this, 'render_custom_fields' ), 10, 3 );
		}

		add_action( 'woocommerce_save_product_variation', array( $this, 'save' ), 10, 2 );
		add_action( 'init', array( $this, 'register_meta' ), $args['init_priority'] );
	}

	public function register_meta() {
		foreach ( $this->get_items() as $item ) {
			register_post_meta( 'product', $item['id'], array(
				'type'        => $this->get_item_type( $item ),
				'description' => $item['title'],
				'single'      => true,
				'default'     => $item['default'] ?? null,
			) );
		}
	}

	public function get_items() {
		$items = apply_filters( 'wcf_product_variation_options_items', $this->items, array(
			'after' => $this->after,
		) );

		return $this->prepare_items( $items );
	}

	/**
	 * @return void
	 */
	public function set_wcf_shown( WP_Screen $current_screen ) {
		global $pagenow;

		$this->wcf_shown = ( $current_screen->base === 'post'
		                     && $current_screen->post_type === 'product'
		                     && in_array( $pagenow, array( 'post-new.php', 'post.php' ) ) );
	}

	/**
	 * @return void
	 */
	public function render_custom_fields( $loop, $variation_data, $variation ) {
		$display_callback = $this->display;

		if ( ! $display_callback() ) {
			return;
		}

		$this->set_post( $variation->ID );
		$this->render_fields();

		echo '<script>document.dispatchEvent(new CustomEvent(\'wcf_product_variation_loaded\',{detail:{id:' . $variation->ID . ',loop:' . $loop . '}}))</script>';
	}

	/**
	 * @param number $post_id
	 */
	public function set_post( $post_id ) {
		$this->product_variation_id = $post_id;
	}

	/**
	 * @return array
	 */
	public function get_data() {
		return array(
			'product_variation_id' => $this->product_variation_id,
			'object_type'          => 'product_variation_options',
			'items'                => $this->items,
		);
	}

	/**
	 * @param string $name
	 *
	 * @return mixed
	 */
	public function get_field( string $name, array $item ) {
		if ( ! empty( $item['callback_get'] ) ) {
			return call_user_func( $item['callback_get'], $item, $this->product_variation_id );
		} else {
			return get_post_meta( $this->product_variation_id, $name, true );
		}
	}

	/**
	 * @param number $product_variation_id
	 * @param number $loop
	 */
	public function save( $product_variation_id, $loop ) {
		$this->set_post( $product_variation_id, );

		foreach ( $this->items as $item ) {
			if ( ! isset( $_POST[ $item['id'] ][ $loop ] ) ) {
				continue;
			}

			$sanitizer = $this->sanitizer->get_sanitizer( $item );
			$value     = $sanitizer( wp_unslash( $_POST[ $item['id'] ][ $loop ] ) );

			$this->set_field( $item['id'], $value, $item );
		}
	}

	/**
	 * @param string $name
	 * @param string $value
	 * @param array $item
	 *
	 * @return bool|int
	 */
	public function set_field( $name, $value, $item ) {
		if ( ! empty( $item['callback_set'] ) ) {
			return call_user_func( $item['callback_set'], $item, $this->product_variation_id, $value );
		} else {
			return update_post_meta( $this->product_variation_id, $name, wp_slash( $value ) );
		}
	}
}
