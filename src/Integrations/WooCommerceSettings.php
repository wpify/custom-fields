<?php

namespace Wpify\CustomFields\Integrations;

use Closure;
use WC_Admin_Settings;
use WP_Screen;
use Wpify\CustomFields\CustomFields;

class WooCommerceSettings extends Integration {
	public readonly array $tab;
	public readonly array $section;
	public readonly array $items;
	public readonly string $class;
	public bool $is_new_tab = false;
	public readonly Closure|array|string|null $display;
	public readonly string $id;
	public readonly array $tabs;
	public readonly string $option_name;

	public function __construct( array $args, CustomFields $custom_fields ) {
		parent::__construct( $custom_fields );

		$this->tab     = $args['tab'] ?? array();
		$this->section = $args['section'] ?? array();
		$this->class   = $args['class'] ?? '';
		$this->items   = $args['items'] ?? array();
		$this->tabs    = $args['tabs'] ?? array();

		if ( isset( $args['display'] ) && is_callable( $args['display'] ) ) {
			$this->display = $args['display'];
		} else {
			$this->display = function () use ( $args ) {
				return $args['display'] ?? true;
			};
		}

		$this->id = $args['id'] ?? join(
			'_',
			array(
				'wc_settings_',
				$this->tabs['id'] ?? '',
				$this->section['id'] ?? '',
				wp_generate_uuid4(),
			),
		);

		add_filter( 'woocommerce_settings_tabs_array', array( $this, 'woocommerce_settings_tabs_array' ), 30 );
		add_filter( 'woocommerce_get_sections_' . $this->tab['id'], array( $this, 'woocommerce_get_sections' ) );
		add_action( 'woocommerce_settings_' . $this->tab['id'], array( $this, 'render' ), 11 );
		add_action( 'woocommerce_settings_save_' . $this->tab['id'], array( $this, 'save' ) );

		// Nonce verification is not needed here, we are just displaying a message.
		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		$tab              = sanitize_text_field( wp_unslash( $_REQUEST['tab'] ?? '' ) );
		$section          = sanitize_text_field( wp_unslash( $_REQUEST['section'] ?? '' ) );
		$settings_updated = sanitize_text_field( wp_unslash( $_REQUEST['settings-updated'] ?? '' ) );
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		if ( $tab === $this->tab['id'] && $section === $this->section['id'] && $settings_updated === '1' ) {
			WC_Admin_Settings::add_message( __( 'Your settings have been saved.', 'woocommerce' ) );
		}
	}

	public function woocommerce_settings_tabs_array( $tabs ) {
		$display_callback = $this->display;

		if ( ! $display_callback() ) {
			return $tabs;
		}

		if ( empty( $tabs[ $this->tab['id'] ] ) ) {
			$tabs[ $this->tab['id'] ] = $this->tab['label'];
			$this->is_new_tab         = true;
		}

		return $tabs;
	}

	public function woocommerce_get_sections( $sections ) {
		$display_callback = $this->display;

		if ( ! boolval( $display_callback() ) ) {
			return $sections;
		}

		if ( ! empty( $this->section ) ) {
			$sections[ $this->section['id'] ] = $this->section['label'];
		}

		if ( isset( $sections[''] ) ) {
			$empty_section      = $sections[''];
			$reordered_sections = array( '' => $empty_section );
			unset( $sections[''] );

			foreach ( $sections as $id => $label ) {
				$reordered_sections[ $id ] = $label;
			}

			$sections = $reordered_sections;
		}

		return $sections;
	}

	public function render() {
		global $current_section;

		$display_callback = $this->display;

		if ( ! $display_callback() ) {
			return;
		}

		if ( $this->is_new_tab ) {
			$sections = apply_filters( 'woocommerce_get_sections_' . $this->tab['id'], array() );

			if ( ! empty( $sections ) || count( $sections ) > 1 ) {
				$array_keys = array_keys( $sections );
				?>
				<ul class="subsubsub">
					<?php
					foreach ( $sections as $id => $label ) {
						$url = add_query_arg(
							array(
								'page'    => 'wc-settings',
								'tab'     => urlencode( $this->tab['id'] ),
								'section' => sanitize_title( $id ),
							),
							admin_url( 'admin.php' ),
						);
						?>
						<li>
							<a href="<?php echo esc_url( $url ); ?>"
								class="<?php echo $current_section == $id ? 'current' : ''; ?>"
							>
								<?php echo wp_kses_post( $label ); ?>
							</a>
							<?php echo end( $array_keys ) == $id ? '' : '|'; ?>
						</li>
						<?php
					}
					?>
				</ul>
				<br class="clear" />
				<?php
			}
		}

		if ( $current_section !== $this->section['id'] ) {
			return;
		}

		$this->enqueue();
		$this->print_app( 'woocommerce-options', $this->tabs );

		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			$this->print_field( $item );
		}
	}

	public function save() {
		// Nonce verification is not needed here, nonce already verified in WooCommerce.
		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		$tab     = sanitize_text_field( wp_unslash( $_REQUEST['tab'] ?? '' ) );
		$section = sanitize_text_field( wp_unslash( $_REQUEST['section'] ?? '' ) );
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		$items = $this->normalize_items( $this->items );

		if ( $tab === $this->tab['id'] && $section === $this->section['id'] ) {
			foreach ( $items as $item ) {
				// Nonce verification is not needed here, nonce already verified in WooCommerce.
				// phpcs:ignore WordPress.Security.NonceVerification.Missing
				if ( ! isset( $_POST[ $item['id'] ] ) ) {
					continue;
				}

				$this->set_field(
					$item['id'],
					$this->get_sanitized_post_item_value( $item ),
					$item,
				);
			}

			wp_redirect(
				add_query_arg(
					array(
						'page'             => 'wc-settings',
						'tab'              => $this->tab['id'],
						'section'          => $this->section['id'],
						'settings-updated' => true,
					),
					admin_url( 'admin.php' ),
				),
			);

			exit;
		}
	}

	public function get_field( string $name, $item = array() ): mixed {
		if ( isset( $item['callback_get'] ) && is_callable( $item['callback_get'] ) ) {
			return call_user_func( $item['callback_get'], $item );
		}

		if ( ! empty( $this->option_name ) ) {
			$data = get_option( $this->option_name, array() );

			return $data[ $name ] ?? null;
		} else {
			return get_option( $name, null );
		}
	}

	public function set_field( string $name, $value, $item = array() ) {
		if ( isset( $item['callback_set'] ) && is_callable( $item['callback_set'] ) ) {
			return call_user_func( $item['callback_set'], $item, $value );
		}

		if ( ! empty( $this->option_name ) ) {
			$data          = get_option( $this->option_name, array() );
			$data[ $name ] = $value;

			return update_option( $this->option_name, $data );
		} else {
			return update_option( $name, $value );
		}
	}
}
