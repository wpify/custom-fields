<?php

namespace Wpify\CustomFields\Integrations;

use Automattic\WooCommerce\Internal\DataStores\Orders\CustomOrdersTableController;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\exceptions\MissingArgumentException;

class OrderMetabox extends Integration {
	public readonly string            $id;
	public int                        $order_id;
	public readonly string            $title;
	public readonly string            $context;
	public readonly string            $priority;
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
	public readonly string            $nonce;

	/**
	 * @throws MissingArgumentException
	 */
	public function __construct(
		array $args,
		CustomFields $custom_fields,
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


		if ( is_callable( $args['display'] ) ) {
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
		$this->items         = $args['items'] ?? array();
		$this->capability    = $args['capability'] ?? 'manage_woocommerce';
		$this->callback      = $args['callback'] ?? null;
		$this->tabs          = $args['tabs'] ?? [];


		$this->id = sanitize_title(
			join(
				'-',
				array(
					'order-meta',
					$this->hook_priority
				),
			),
		);

		$this->nonce = $this->id . '-nonce';
		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
		add_action( 'woocommerce_update_order', array( $this, 'save' ) );
	}


	/**
	 * @param string $post_type
	 */
	public function add_meta_box( $post_type ) {
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
			'custom',
			'Custom Meta Box',
			function () {
				echo 'Hello World';
			},
			$screen,
			'side',
			'high'
		);

		add_meta_box(
			$this->id,
			$this->title,
			array( $this, 'render' ),
			$screen,
			$this->context,
			$this->priority
		);
	}

	/**
	 * @param WP_Post $post
	 */
	public function render( $order ) {
		if ( ! current_user_can( $this->capability ) ) {
			return;
		}
		global $post;
		$this->order_id = $order->get_id();
		$this->enqueue();
		$items = $this->normalize_items( $this->items );
		?>

		<?php
		if ( is_callable( $this->callback ) ) {
			call_user_func( $this->callback );
		} ?>

		<?php $this->print_app( 'order-meta', $this->tabs ); ?>

		<?php foreach ( $items as $item ) { ?>
            <p class="form-field">
				<?php $this->print_field( $item ); ?>
            </p>

		<?php } ?>
		<?php
		wp_nonce_field( $this->id, $this->nonce );
	}


	public function get_order() {
		return wc_get_order( $this->order_id );
	}

	/**
	 * @param string $name
	 *
	 * @return mixed
	 */
	public function get_field( $name, $item = array() ) {
		if ( ! empty( $item['callback_get'] ) ) {
			return call_user_func( $item['callback_get'], $item, $this->order_id );
		} else {

			return $this->get_order()->get_meta( $name );
		}
	}

	/**
	 * @param number $post_id
	 *
	 * @return mixed
	 */
	public function save( $post_id ) {
		remove_action( 'woocommerce_update_order', array( $this, 'save' ) );
		if ( ! isset( $_POST[ $this->nonce ] ) ) {
			return $post_id;
		}

		$nonce = $_POST[ $this->nonce ];

		if ( ! wp_verify_nonce( $nonce, $this->id ) ) {
			return $post_id;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return $post_id;
		}

		$this->order_id = $post_id;

		foreach ( $this->items as $item ) {
			if ( ! isset( $_POST[ $item['id'] ] ) ) {
				continue;
			}
			$value = apply_filters( 'wpifycf_sanitize_field_type_' . $item['type'], $_POST[ $item['id'] ], $item );

			$this->set_field( $item['id'], $value, $item );
		}
	}

	/**
	 * @param string $name
	 * @param string $value
	 *
	 * @return bool|int
	 */
	public function set_field( $name, $value, $item ) {
		if ( ! empty( $item['callback_set'] ) ) {
			return call_user_func( $item['callback_set'], $item, $this->order_id, $value );
		} else {
			$o = $this->get_order();
			$o->update_meta_data( $name, $value );

			return $o->save();
		}
	}
}
