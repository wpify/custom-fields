<?php

namespace Wpify\CustomFields\Integrations;

use Closure;
use WC_Product;
use WP_Post;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\exceptions\MissingArgumentException;

class ProductVariationOptions extends ItemsIntegration {
	public readonly string                    $id;
	public int                                $variation_id;
	public readonly array                     $tab;
	public readonly string                    $after;
	public readonly string                    $capability;
	public readonly Closure|array|string|null $callback;
	public readonly array                     $args;
	public readonly string                    $hook_suffix;
	public readonly int                       $hook_priority;
	public readonly array                     $help_tabs;
	public readonly string                    $help_sidebar;
	public                                    $display;
	public readonly string                    $option_name;
	public readonly array                     $items;
	public readonly array                     $sections;
	public readonly array                     $tabs;
	public bool                               $is_new_tab;

	/**
	 * @throws MissingArgumentException
	 */
	public function __construct(
		array $args,
		private CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );

		$required = array( 'items' );
		$missing  = array();

		foreach ( $required as $arg ) {
			if ( empty( $args[ $arg ] ) ) {
				$missing[] = $arg;
			}
		}

		if ( count( $missing ) > 0 ) {
			throw new MissingArgumentException(
				sprintf(
				/* translators: %1$s is a list of missing arguments, %2$s is the class name. */
					esc_html( __( 'Missing arguments %1$s in class %2$s.', 'wpify-custom-fields' ) ),
					esc_html( implode( ', ', $missing ) ),
					__CLASS__,
				),
			);
		}

		if ( isset( $args['display'] ) && is_callable( $args['display'] ) ) {
			$this->display = $args['display'];
		} else {
			$this->display = function () use ( $args ) {
				return $args['display'] ?? true;
			};
		}

		$this->capability    = $args['capability'] ?? 'manage_options';
		$this->callback      = $args['callback'] ?? null;
		$this->after         = $args['after'] ?? '';
		$this->hook_priority = $args['hook_priority'] ?? 10;
		$this->help_tabs     = $args['help_tabs'] ?? array();
		$this->help_sidebar  = $args['help_sidebar'] ?? '';
		$this->option_name   = $args['meta_key'] ?? '';
		$this->items         = $args['items'] ?? array();
		$this->tabs          = $args['tabs'] ?? array();

		$tab = $args['tab'] ?? array();

		if ( empty( $tab['label'] ) ) {
			throw new MissingArgumentException(
				sprintf(
				/* translators: %1$s is the class name. */
					esc_html( __( 'Missing argument $tab["label"] in class %2$s.', 'wpify-custom-fields' ) ),
					__CLASS__,
				),
			);
		}

		if ( empty( $tab['id'] ) ) {
			$tab['id'] = sanitize_title( $tab['label'] );
		}

		if ( empty( $tab['target'] ) ) {
			$tab['target'] = $tab['id'];
		}

		if ( empty( $tab['priority'] ) ) {
			$tab['priority'] = 100;
		}

		if ( empty( $tab['class'] ) ) {
			$tab['class'] = array();
		}

		$this->tab        = $tab;
		$this->is_new_tab = false;
		$this->id         = sanitize_title(
			join(
				'-',
				array(
					'variation-options',
					$this->tab['id'],
					sanitize_title( $this->tab['label'] ),
					$this->hook_priority,
				),
			),
		);

		if ( in_array( $this->after, array( 'pricing', 'inventory', 'dimensions', 'download' ) ) ) {
			add_action( 'woocommerce_variation_options_' . $this->after, array( $this, 'render' ), 10, 3 );
		} else {
			add_action( 'woocommerce_product_after_variable_attributes', array( $this, 'render' ), 10, 3 );
		}

		add_action( 'woocommerce_save_product_variation', array( $this, 'save' ), 10, 2 );
		add_action( 'init', array( $this, 'register_meta' ), $this->hook_priority );
		add_action( 'admin_footer', array( $this, 'maybe_enqueue' ) );
	}

	public function render( int $loop, array $variation_data, WP_Post $variation ): void {
		if ( ! current_user_can( $this->capability ) ) {
			return;
		}

		$this->variation_id = $variation->ID;
		$items              = $this->normalize_items( $this->items );

		if ( is_callable( $this->callback ) ) {
			call_user_func( $this->callback );
		}
		?>
		<div class="options_group">
			<?php
			$this->print_app( 'product-variation', $this->tabs, array( 'loop' => $loop ) );

			foreach ( $items as $item ) {
				$this->print_field( $item, array( 'loop' => $loop ), 'div', 'form-field' );
			}
			?>
		</div>
		<?php
	}

	public function get_product(): bool|WC_Product|null {
		return wc_get_product( $this->get_item_id() );
	}

	public function save( $product_variation_id, $loop ): void {
		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			// Nonce is already verified by WooCommerce.
			// phpcs:ignore WordPress.Security.NonceVerification.Missing
			if ( ! isset( $_POST[ $item['id'] ][ $loop ] ) ) {
				continue;
			}

			$this->variation_id = $product_variation_id;

			$this->set_field(
				$item['id'],
				$this->get_sanitized_post_item_value( $item, $loop ),
				$item,
			);
		}
	}

	public function maybe_enqueue() {
		$current_screen = get_current_screen();
		if ( $current_screen->id === 'product' || $current_screen->id === 'product_page_product' ) {
			$this->enqueue();
		}
	}

	public function register_meta(): void {
		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			register_post_meta(
				'product_variation',
				$item['id'],
				array(
					'type'              => $this->custom_fields->get_wp_type( $item ),
					'description'       => $item['label'],
					'single'            => true,
					'default'           => $this->custom_fields->get_default_value( $item ),
					'sanitize_callback' => $this->custom_fields->sanitize_item_value( $item ),
					'show_in_rest'      => false,
				),
			);
		}
	}

	public function get_option_value( string $name, mixed $default_value ) {
		return $this->get_product()->get_meta( $name ) ?? $default_value;
	}

	public function set_option_value( string $name, mixed $value ) {
		$product = $this->get_product();
		$product->update_meta_data( $name, $value );

		return $product->save();
	}

	function get_item_id(): int {
		return $this->variation_id;
	}
}
