<?php

namespace Wpify\CustomFields\Integrations;

use Closure;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\exceptions\MissingArgumentException;

class ProductVariationOptions extends Integration {
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
	public readonly array                     $items;
	public readonly array                     $sections;
	public readonly array                     $tabs;
	public bool                               $is_new_tab;

	/**
	 * @throws MissingArgumentException
	 */
	public function __construct(
		array $args,
		CustomFields $custom_fields,
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
		$this->items         = $args['items'] ?? array();
		$this->tabs          = $args['tabs'] ?? array();
		$this->tab           = $args['tab'] ?? [];
		$this->is_new_tab    = false;
		$this->id            = sanitize_title(
			join(
				'-',
				array(
					'product-options',
					$this->tab['id'],
					sanitize_title( $this->tab['label'] ),
					$this->hook_priority,
				),
			),
		);

		if ( in_array( $this->after, array( 'pricing', 'inventory', 'dimensions', 'download' ) ) ) {
			add_action( 'woocommerce_variation_options_' . $this->after, array( $this, 'render_custom_fields', ), 10, 3 );
		} else {
			add_action( 'woocommerce_product_after_variable_attributes', array( $this, 'render_custom_fields', ), 10, 3 );
		}

		add_action( 'woocommerce_save_product_variation', array( $this, 'save' ), 10, 2 );
		add_action( 'init', array( $this, 'register_meta' ), $this->hook_priority );
		add_action( 'admin_footer', array( $this, 'maybe_enqueue' ) );
	}

	/**
	 * @return void
	 */
	public function render_custom_fields( $loop, $variation_data, $variation ) {
		$this->render( $variation->ID, $loop );
	}


	public function render( $variation_id, $loop ): void {
		if ( ! current_user_can( $this->capability ) ) {
			return;
		}

		$this->variation_id = $variation_id;
		$items              = $this->normalize_items( $this->items );

		if ( is_callable( $this->callback ) ) {
			call_user_func( $this->callback );
		}
		?>
		<div class="options_group">
			<?php
			$this->print_app( 'product-options', $this->tabs, [ 'loop' => $loop ] );

			foreach ( $items as $item ) {
				?>
				<div class="form-field">
					<?php $this->print_field( $item, [ 'loop' => $loop ] ); ?>
				</div>
				<?php
			}
			?>
		</div>
		<?php
	}

	public function get_field( $name, $item = array() ): mixed {
		if ( isset( $item['callback_get'] ) && is_callable( $item['callback_get'] ) ) {
			return call_user_func( $item['callback_get'], $item );
		}

		return $this->get_product()->get_meta( $name );
	}

	public function set_field( $name, $value, $item = array() ) {
		if ( isset( $item['callback_set'] ) && is_callable( $item['callback_set'] ) ) {
			return call_user_func( $item['callback_set'], $item, $value );
		}
		$product = $this->get_product();

		$product->update_meta_data( $name, $value );
		return $product->save();
	}

	public function get_product(): bool|\WC_Product|null {
		return wc_get_product( $this->variation_id );
	}

	/**
	 * @param number $product_variation_id
	 */
	public function save( $product_variation_id, $loop ): void {
		foreach ( $this->items as $item ) {
			// Nonce is already verified by WooCommerce.
			// phpcs:ignore WordPress.Security.NonceVerification.Missing
			if ( ! isset( $_POST[ $item['id'] ][ $loop ] ) ) {
				continue;
			}

			$this->variation_id = $product_variation_id;

			// Sanitization is done in the filter to allow custom sanitization. Nonce is already verified by WooCommerce.
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized, WordPress.Security.NonceVerification.Missing
			$value = apply_filters( 'wpifycf_sanitize_field_type_' . $item['type'], wp_unslash( $_POST[ $item['id'] ][ $loop ] ), $item );

			$this->set_field(
				$item['id'],
				$value,
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
			$wp_type          = apply_filters( 'wpifycf_field_type_' . $item['type'], 'string', $item );
			$wp_default_value = apply_filters( 'wpifycf_field_' . $wp_type . '_default_value', '', $item );
			$sanitizer        = fn( $value ) => apply_filters( 'wpifycf_sanitize_field_type_' . $item['type'], $value, $item );

			register_post_meta(
				'product_variation',
				$item['id'],
				array(
					'type'              => $wp_type,
					'description'       => $item['label'],
					'single'            => true,
					'default'           => $item['default'] ?? $wp_default_value,
					'sanitize_callback' => $sanitizer,
					'show_in_rest'      => false,
				),
			);
		}
	}
}
