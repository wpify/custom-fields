<?php

namespace Wpify\CustomFields\Integrations;

use Automattic\WooCommerce\Internal\DataStores\Orders\CustomOrdersTableController;
use Closure;
use WC_Order;
use WC_Order_Refund;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\Exceptions\MissingArgumentException;

class OrderMetabox extends ItemsIntegration {
	public readonly string                    $id;
	public int                                $order_id;
	public readonly string                    $title;
	public readonly string                    $context;
	public readonly string                    $priority;
	public readonly string                    $capability;
	public readonly Closure|array|string|null $callback;
	public readonly array                     $args;
	public readonly string                    $hook_suffix;
	public readonly int                       $hook_priority;
	public                                    $display;
	public readonly string                    $option_name;
	public readonly array                     $items;
	public readonly array                     $sections;
	public readonly array                     $tabs;
	public readonly string                    $nonce;

	/**
	 * @throws MissingArgumentException
	 */
	public function __construct(
		array $args,
		public CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );

		$required = array( 'items', 'title' );
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
				return $args['display'];
			};
		}

		$this->title         = $args['title'] ?? '';
		$this->context       = $args['context'] ?? 'advanced';
		$this->hook_priority = 10;
		$this->priority      = $args['priority'] ?? 'default';
		$this->option_name   = $args['meta_key'] ?? '';
		$this->items         = $args['items'] ?? array();
		$this->capability    = $args['capability'] ?? 'manage_woocommerce';
		$this->callback      = $args['callback'] ?? null;
		$this->tabs          = $args['tabs'] ?? array();
		$this->id            = sanitize_title(
			join(
				'-',
				array(
					'order-meta',
					$this->hook_priority,
					$this->title,
				),
			),
		);
		$this->nonce         = $this->id . '-nonce';

		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
		add_action( 'woocommerce_update_order', array( $this, 'save' ) );
	}


	public function add_meta_box( string $post_type ): void {
		if ( ! $this->display ) {
			return;
		}

		$screen = wc_get_container()->get( CustomOrdersTableController::class )->custom_orders_table_usage_is_enabled()
			? wc_get_page_screen_id( 'shop-order' )
			: 'shop_order';

		if ( $screen !== $post_type ) {
			return;
		}

		add_meta_box(
			$this->id,
			$this->title,
			array( $this, 'render' ),
			$screen,
			$this->context,
			$this->priority,
		);
	}

	public function render( WC_Order $order ): void {
		if ( ! current_user_can( $this->capability ) ) {
			return;
		}

		$this->order_id = $order->get_id();
		$this->enqueue();

		$items = $this->normalize_items( $this->items );

		if ( is_callable( $this->callback ) ) {
			call_user_func( $this->callback );
		}

		wp_nonce_field( $this->id, $this->nonce );
		$this->print_app( 'order-meta', $this->tabs );

		foreach ( $items as $item ) {
			?>
			<div class="form-field">
				<?php $this->print_field( $item ); ?>
			</div>
			<?php
		}
	}

	public function get_order(): bool|WC_Order|WC_Order_Refund {
		return wc_get_order( $this->order_id );
	}

	public function save( int $post_id ): int {
		remove_action( 'woocommerce_update_order', array( $this, 'save' ) );

		if ( ! isset( $_POST[ $this->nonce ] ) ) {
			return $post_id;
		}

		$nonce = sanitize_text_field( wp_unslash( $_POST[ $this->nonce ] ) );

		if ( ! wp_verify_nonce( $nonce, $this->id ) ) {
			return $post_id;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return $post_id;
		}

		$this->order_id = $post_id;
		$items          = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			if ( ! isset( $_POST[ $item['id'] ] ) ) {
				continue;
			}

			$this->set_field(
				$item['id'],
				$this->get_sanitized_post_item_value( $item ),
				$item,
			);
		}

		return $post_id;
	}

	public function get_option_value( string $name, mixed $default_value ) {
		return $this->get_order()->get_meta( $name ) ?? $default_value;
	}

	public function set_option_value( string $name, mixed $value ) {
		$order = $this->get_order();
		$order->update_meta_data( $name, $value );

		return $order->save();

	}

	function get_item_id(): int {
		return $this->order_id;
	}
}
