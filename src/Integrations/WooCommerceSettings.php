<?php
/**
 * Class WooCommerceSettings
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Integrations;

use Closure;
use WC_Admin_Settings;
use Wpify\CustomFields\CustomFields;

/**
 * Class WooCommerceSettings
 *
 * Handles the display, saving, and management of WooCommerce settings tabs and sections.
 */
class WooCommerceSettings extends OptionsIntegration {
	/**
	 * Tab definition where a new settings page will be created.
	 *
	 * @var array
	 */
	public readonly array $tab;

	/**
	 * Section definition in Tab where a new settings page will be created.
	 *
	 * @var array
	 */
	public readonly array $section;

	/**
	 * List of the fields to be shown.
	 *
	 * @var array
	 */
	public readonly array $items;

	/**
	 * Defines if the current tab is a new tab.
	 *
	 * @var bool
	 */
	public bool $is_new_tab = false;

	/**
	 * Callback that returns boolean that defines if custom fields should be shown.
	 *
	 * @var Closure|array|string|null
	 */
	public readonly Closure|array|string|null $display;

	/**
	 * ID of the custom fields options instance.
	 *
	 * @var string
	 */
	public readonly string $id;

	/**
	 * Tabs used for the custom fields.
	 *
	 * @var array
	 */
	public readonly array $tabs;

	/**
	 * Option Name used to store the custom fields values.
	 *
	 * @var string
	 */
	public readonly string $option_name;

	/**
	 * Constructor method.
	 *
	 * @param array        $args Configuration arguments for the class instance.
	 * @param CustomFields $custom_fields An instance of the CustomFields class.
	 *
	 * @return void
	 */
	public function __construct(
		array $args,
		CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );

		$this->tab         = $args['tab'] ?? array();
		$this->section     = $args['section'] ?? array();
		$this->items       = $args['items'] ?? array();
		$this->tabs        = $args['tabs'] ?? array();
		$this->option_name = $args['option_name'] ?? '';

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

		// Nonce verification is not needed here, we are just setting a current tab, section and displaying message.
		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		$tab              = sanitize_text_field( wp_unslash( $_REQUEST['tab'] ?? '' ) );
		$section          = sanitize_text_field( wp_unslash( $_REQUEST['section'] ?? '' ) );
		$settings_updated = sanitize_text_field( wp_unslash( $_REQUEST['settings-updated'] ?? '' ) );
		// phpcs:enable

		if ( $tab === $this->tab['id'] && $section === $this->section['id'] && '1' === $settings_updated ) {
			WC_Admin_Settings::add_message( __( 'Your settings have been saved.', 'wpify-custom-fields' ) );
		}
	}

	/**
	 * Filters the WooCommerce settings tabs array to add a custom tab if necessary.
	 *
	 * @param array $tabs The existing array of WooCommerce settings tabs.
	 *
	 * @return array The modified array of WooCommerce settings tabs.
	 */
	public function woocommerce_settings_tabs_array( array $tabs ): array {
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

	/**
	 * Adds or updates WooCommerce sections based on the instance configuration.
	 *
	 * @param array $sections An array of existing sections.
	 *
	 * @return array Modified array of sections.
	 */
	public function woocommerce_get_sections( array $sections ): array {
		$display_callback = $this->display;

		if ( ! $display_callback() ) {
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

	/**
	 * Render the settings page or section.
	 *
	 * @return void
	 */
	public function render(): void {
		global $current_section;

		$display_callback = $this->display;

		if ( ! $display_callback() ) {
			return;
		}

		if ( $this->is_new_tab ) {
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
			$sections = apply_filters( 'woocommerce_get_sections_' . $this->tab['id'], array() );

			if ( is_array( $sections ) && count( $sections ) > 1 ) {
				$array_keys = array_keys( $sections );
				?>
				<ul class="subsubsub">
					<?php
					foreach ( $sections as $id => $label ) {
						$url = add_query_arg(
							array(
								'page'    => 'wc-settings',
								'tab'     => rawurlencode( $this->tab['id'] ),
								'section' => sanitize_title( $id ),
							),
							admin_url( 'admin.php' ),
						);
						?>
						<li>
							<a href="<?php echo esc_url( $url ); ?>"
								class="<?php echo $current_section === $id ? 'current' : ''; ?>"
							>
								<?php echo wp_kses_post( $label ); ?>
							</a>
							<?php echo end( $array_keys ) === $id ? '' : '|'; ?>
						</li>
						<?php
					}
					?>
				</ul>
				<br class="clear"/>
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

	/**
	 * Save the settings for the specified tab and section.
	 *
	 * @return void
	 */
	public function save(): void {
		// Nonce verification is not needed here, nonce already verified in WooCommerce.
		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		$tab     = sanitize_text_field( wp_unslash( $_REQUEST['tab'] ?? '' ) );
		$section = sanitize_text_field( wp_unslash( $_REQUEST['section'] ?? '' ) );
		// phpcs:enable

		if ( $tab === $this->tab['id'] && $section === $this->section['id'] ) {
			$this->set_fields_from_post_request( $this->normalize_items( $this->items ) );
			wp_safe_redirect(
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

	/**
	 * Retrieves the value of the specified option.
	 *
	 * @param string $name The name of the option to retrieve.
	 * @param mixed  $default_value The default value to return if the option does not exist.
	 *
	 * @return mixed The value of the option or the default value if the option does not exist.
	 */
	public function get_option_value( string $name, mixed $default_value ): mixed {
		return get_option( $name, $default_value );
	}

	/**
	 * Sets the value of the specified option.
	 *
	 * @param string $name The name of the option to set.
	 * @param mixed  $value The value to set for the option.
	 *
	 * @return bool True on success, false on failure.
	 */
	public function set_option_value( string $name, mixed $value ): bool {
		return update_option( $name, $value );
	}
}
