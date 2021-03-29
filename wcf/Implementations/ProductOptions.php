<?php

namespace WpifyCustomFields\Implementations;

use WC_Product;

final class ProductOptions {
	/** @var array */
	private $tab;

	private $items;

	private $is_new_tab = false;

	public function __construct( array $args = array() ) {
		/*
		 * Possible classes: hide_if_grouped, show_if_simple, show_if_variable, show_if_grouped,
		 * show_if_external, hide_if_external, hide_if_grouped, hide_if_virtual
		 */
		$args = wp_parse_args( $args, array(
				'tab'   => array(
						'id'       => 'general',
						'label'    => null,
						'priority' => 100,
						'target'   => 'general_product_data',
						'class'    => array(),
				),
				'items' => array(),
		) );

		$this->tab   = $args['tab'];
		$this->items = $args['items'];

		if ( empty( $this->tab['target'] ) ) {
			$this->tab['target'] = $this->tab['id'] . '_product_data';
		}

		if ( empty( $this->tab['priority'] ) ) {
			$this->tab['priority'] = 100;
		}

		if ( empty( $this->tab['class'] ) ) {
			$this->tab['class'] = array();
		}

		$this->setup();
	}

	public function setup() {
		add_filter( 'woocommerce_product_data_tabs', array( $this, 'woocommerce_product_data_tabs' ), 98 );
		add_action( 'woocommerce_product_data_panels', array( $this, 'render_data_panels' ) );
		add_action( 'woocommerce_product_options_' . $this->tab['target'], array( $this, 'render_custom_fields' ) );
		add_action( 'woocommerce_process_product_meta', array( $this, 'save' ) );
	}

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

	public function render_data_panels() {
		if ( $this->is_new_tab ) {
			?>
			<div id="<?php echo esc_attr( $this->tab['target'] ) ?>" class="panel woocommerce_options_panel">
				<?php do_action( 'woocommerce_product_options_' . $this->tab['target'] ); ?>
			</div>
			<?php
		}
	}

	public function render_custom_fields() {
		global $post;

		$product = wc_get_product( $post );
		$data    = $this->get_data();

		foreach ( $data['items'] as $key => $item ) {
			if ( empty( $data['items'][ $key ]['id'] ) ) {
				$data['items'][ $key ]['id'] = $data['items'][ $key ]['name'];
			}

			$value = $this->get_field( $product->get_id(), $item['name'] );

			if ( empty( $value ) ) {
				$data['items'][ $key ]['value'] = '';
			} else {
				$data['items'][ $key ]['value'] = $value;
			}
		}

		$json = wp_json_encode( $data );
		?>
		<div class="js-wcf" data-wcf="<?php echo esc_attr( $json ) ?>"></div>
		<?php
	}

	public function get_data() {
		return array(
				'object_type' => 'product_options',
				'tab'         => $this->tab,
				'items'       => $this->items,
		);
	}

	public function get_field( $product_id, $name ) {
		return get_post_meta( $product_id, $name, true );
	}

	public function set_field($product_id, $name, $value) {
		// TODO: Sanitize the item by it's type
		return update_post_meta( $product_id, $name, $value );
	}

	public function save( $post_id ) {
		foreach ( $this->items as $item ) {
			$value = $_POST[ $item['name'] ];
			$this->set_field( $post_id, $item['name'], $value );
		}
	}
}
