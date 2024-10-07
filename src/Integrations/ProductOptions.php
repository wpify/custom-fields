<?php

namespace Wpify\CustomFields\Integrations;

use WC_Product;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\Exceptions\MissingArgumentException;

class ProductOptions extends Integration {
	public readonly string            $id;
	public int                        $product_id;
	public readonly array             $tab;
	public readonly string            $capability;
	public readonly array|string|null $callback;
	public readonly array             $args;
	public readonly string            $hook_suffix;
	public readonly int               $hook_priority;
	public readonly array             $help_tabs;
	public readonly string            $help_sidebar;
	public                            $display;
	public readonly string            $option_name;
	public readonly array             $items;
	public readonly array             $sections;
	public readonly array             $tabs;
	public bool                       $is_new_tab;

	/**
	 * @throws MissingArgumentException
	 */
	public function __construct(
		array $args,
		CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );

		$required = array( 'tab', 'items' );
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
		$this->hook_priority = $args['hook_priority'] ?? 10;
		$this->help_tabs     = $args['help_tabs'] ?? array();
		$this->help_sidebar  = $args['help_sidebar'] ?? '';
		$this->items         = $args['items'] ?? array();
		$this->option_name   = $args['option_name'] ?? '';
		$this->tabs          = $args['tabs'] ?? array();
		$this->is_new_tab    = false;

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

		$this->tab = $tab;
		$this->id  = sanitize_title(
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

		add_filter( 'woocommerce_product_data_tabs', array( $this, 'woocommerce_product_data_tabs' ), 98 );
		add_action( 'woocommerce_product_data_panels', array( $this, 'render_data_panels' ) );
		add_action( 'woocommerce_product_options_' . $this->tab['target'] ?? $this->tab['id'], array( $this, 'render' ) );
		add_action( 'woocommerce_process_product_meta', array( $this, 'save' ) );
		add_action( 'init', array( $this, 'register_meta' ), $this->hook_priority );
	}

	public function woocommerce_product_data_tabs( array $tabs ): array {
		if ( isset( $tabs[ $this->tab['id'] ] ) ) {
			if ( ! empty( $this->tab['label'] ) ) {
				$tabs[ $this->tab['id'] ]['label'] = $this->tab['label'];
			}

			if ( ! empty( $this->tab['priority'] ) ) {
				$tabs[ $this->tab['id'] ]['priority'] = $this->tab['priority'];
			}
		} else {
			$this->is_new_tab = true;

			$tabs[ $this->tab['id'] ] = array(
				'label'    => $this->tab['label'],
				'priority' => $this->tab['priority'],
				'target'   => $this->tab['target'],
				'class'    => $this->tab['class'],
			);
		}

		return $tabs;
	}


	public function render_data_panels(): void {
		?>
		<div id="<?php echo esc_attr( $this->tab['target'] ) ?>" class="panel woocommerce_options_panel">
			<?php do_action( 'woocommerce_product_options_' . $this->tab['target'] ); ?>
		</div>
		<?php
	}

	public function render(): void {
		if ( ! current_user_can( $this->capability ) ) {
			return;
		}

		global $post;

		$this->product_id = $post->ID;
		$this->enqueue();
		$items = $this->normalize_items( $this->items );

		if ( is_callable( $this->callback ) ) {
			call_user_func( $this->callback );
		}
		?>
		<div class="options_group">
			<?php
			$this->print_app( 'product-options', $this->tabs );

			foreach ( $items as $item ) {
				?>
				<div class="form-field">
					<?php $this->print_field( $item ); ?>
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

	public function get_product(): bool|WC_Product|null {
		return wc_get_product( $this->product_id );
	}

	public function save( $post_id ): void {
		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			// Nonce already verified by WordPress.
			// phpcs:ignore WordPress.Security.NonceVerification.Missing
			if ( ! isset( $_POST[ $item['id'] ] ) ) {
				continue;
			}

			$this->product_id = $post_id;

			$this->set_field(
				$item['id'],
				$this->get_sanitized_post_item_value( $item ),
				$item,
			);
		}
	}

	public function register_meta(): void {
		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			$wp_type          = apply_filters( 'wpifycf_field_type_' . $item['type'], 'string', $item );
			$wp_default_value = apply_filters( 'wpifycf_field_' . $wp_type . '_default_value', '', $item );
			$sanitizer        = fn( $value ) => apply_filters( 'wpifycf_sanitize_field_type_' . $item['type'], $value, $item );

			register_post_meta(
				'product',
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
