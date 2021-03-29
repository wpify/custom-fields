<?php

namespace WpifyCustomFields\Implementations;

use WC_Admin_Settings;

final class WooCommerceSettings extends AbstractImplementation {
	private $tab;
	private $section;
	private $items;
	private $is_new_tab = false;

	public function __construct( array $args = array() ) {
		$args = wp_parse_args( $args, array(
				'tab'     => array( 'id' => '', 'label' => null ),
				'section' => array( 'id' => '', 'label' => null ),
				'items'   => array(),
		) );

		$this->tab     = $args['tab'];
		$this->section = $args['section'];
		$this->items   = $this->prepare_items( $args['items'] );

		$this->setup();
	}

	public function setup() {
		add_filter( 'woocommerce_settings_tabs_array', array( $this, 'woocommerce_settings_tabs_array' ), 30 );
		add_filter( 'woocommerce_get_sections_' . $this->tab['id'], array( $this, 'woocommerce_get_sections' ) );
		add_action( 'woocommerce_settings_' . $this->tab['id'], array( $this, 'render' ), 11 );
		add_action( 'woocommerce_settings_save_' . $this->tab['id'], array( $this, 'save' ) );
	}

	public function woocommerce_settings_tabs_array( $tabs ) {
		if ( empty( $tabs[ $this->tab['id'] ] ) ) {
			$tabs[ $this->tab['id'] ] = $this->tab['label'];
			$this->is_new_tab         = true;
		}

		return $tabs;
	}

	public function woocommerce_get_sections( $sections ) {
		if ( ! empty( $this->section ) ) {
			$sections[ $this->section['id'] ] = $this->section['label'];
		}

		return $sections;
	}

	public function render() {
		global $current_section;

		if ( $this->is_new_tab ) {
			$sections = $this->get_sections();

			if ( empty( $sections ) || 1 === count( $sections ) ) {
				return;
			}

			$array_keys = array_keys( $sections );
			?>
			<ul class="subsubsub">
				<?php foreach ( $sections as $id => $label ): ?>
					<li>
						<a href="<?php echo admin_url( 'admin.php?page=wc-settings&tab=' . $this->tab['id'] . '&section=' . sanitize_title( $id ) ); ?>"
						   class="<?php echo $current_section == $id ? 'current' : ''; ?>">
							<?php echo $label; ?>
						</a>
						<?php echo end( $array_keys ) == $id ? '' : '|'; ?>
					</li>
				<?php endforeach; ?>
			</ul>
			<br class="clear"/>
			<?php
		}

		if ( $current_section !== $this->section['id'] ) {
			return;
		}

		$this->render_fields();
	}

	public function get_sections() {
		return apply_filters( 'woocommerce_get_sections_' . $this->tab['id'], array() );
	}

	public function get_data() {
		return array(
				'object_type' => 'woocommerce_settings',
				'tab'         => $this->tab,
				'section'     => $this->section,
				'items'       => $this->items,
		);
	}

	public function get_field( $name, $default = '' ) {
		return WC_Admin_Settings::get_option( $name, $default );
	}

	public function save() {
		foreach ( $this->items as $item ) {
			$this->set_field( $item['name'], $_POST[ $item['name'] ] );
		}
	}

	public function set_field( $name, $value ) {
		// TODO: Sanitize
		return update_option( $name, $value );
	}
}
