<?php

namespace Wpify\CustomFields\Implementations;

use WP_Screen;
use Wpify\CustomFields\CustomFields;

/**
 * Class ProductOptions
 * @package CustomFields\Implementations
 */
final class ProductOptions extends AbstractPostImplementation {
	/** @var int */
	private $product_id;

	/** @var array */
	private $tab;

	/** @var array */
	private $items;

	/** @var bool */
	private $is_new_tab = false;

	/** @var callable */
	private $display;

	/**
	 * ProductOptions constructor.
	 *
	 * @param array        $args
	 * @param CustomFields $wcf
	 */
	public function __construct( array $args, CustomFields $wcf ) {
		parent::__construct( $args, $wcf );

		/*
		 * Possible classes: hide_if_grouped, show_if_simple, show_if_variable, show_if_grouped,
		 * show_if_external, hide_if_external, hide_if_grouped, hide_if_virtual
		 */
		$args = wp_parse_args( $args, array(
				'product_id'    => null,
				'tab'           => array(
						'id'       => 'general',
						'label'    => null,
						'priority' => 100,
						'target'   => null,
						'class'    => array(),
				),
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

		$this->tab        = $args['tab'];
		$this->items      = $this->prepare_items( $args['items'] );
		$this->product_id = $args['product_id'];

		if ( empty( $this->tab['target'] ) ) {
			$this->tab['target'] = $this->tab['id'] . '_product_data';
		}

		if ( empty( $this->tab['priority'] ) ) {
			$this->tab['priority'] = 100;
		}

		if ( empty( $this->tab['class'] ) ) {
			$this->tab['class'] = array();
		}

		add_filter( 'woocommerce_product_data_tabs', array( $this, 'woocommerce_product_data_tabs' ), 98 );
		add_action( 'woocommerce_product_data_panels', array( $this, 'render_data_panels' ) );
		add_action( 'woocommerce_product_options_' . $this->tab['target'], array( $this, 'render_custom_fields' ) );
		add_action( 'woocommerce_process_product_meta', array( $this, 'save' ) );
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
		$items = apply_filters( 'wcf_product_options_items', $this->items, array(
				'tab' => $this->tab,
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
	 * @param array $tabs
	 *
	 * @return array
	 */
	public function woocommerce_product_data_tabs( array $tabs ) {
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

	/**
	 * @return void
	 */
	public function render_data_panels() {
		$display_callback = $this->display;

		if ( ! boolval( $display_callback() ) ) {
			return;
		}

		if ( $this->is_new_tab ) {
			?>
			<div id="<?php echo esc_attr( $this->tab['target'] ) ?>" class="panel woocommerce_options_panel">
				<?php do_action( 'woocommerce_product_options_' . $this->tab['target'] ); ?>
			</div>
			<?php
		}
	}

	/**
	 * @return void
	 */
	public function render_custom_fields() {
		$display_callback = $this->display;

		if ( ! boolval( $display_callback() ) ) {
			return;
		}

		global $post;

		$this->set_post( $post->ID );
		$this->render_fields();
	}

	/**
	 * @param number $post_id
	 */
	public function set_post( $post_id ) {
		$this->product_id = $post_id;
	}

	/**
	 * @return array
	 */
	public function get_data() {
		return array(
				'object_type' => 'product_options',
				'tab'         => $this->tab,
				'items'       => $this->items,
		);
	}

	/**
	 * @param string $name
	 *
	 * @return mixed
	 */
	public function get_field( string $name, array $item ) {
		if ( ! empty( $item['callback_get'] ) ) {
			return call_user_func( $item['callback_get'], $item, $this->product_id );
		} else {
			return get_post_meta( $this->product_id, $name, true );
		}
	}

	/**
	 * @param number $post_id
	 */
	public function save( $post_id ) {
		$this->set_post( $post_id );

		foreach ( $this->items as $item ) {
			if ( ! isset( $_POST[ $item['id'] ] ) ) {
				continue;
			}

			$sanitizer = $this->sanitizer->get_sanitizer( $item );
			$value     = $sanitizer( wp_unslash( $_POST[ $item['id'] ] ) );

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
			return call_user_func( $item['callback_set'], $item, $this->product_id, $value );
		} else {
			return update_post_meta( $this->product_id, $name, wp_slash( $value ) );
		}
	}
}
