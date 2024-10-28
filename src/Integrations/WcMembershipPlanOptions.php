<?php
/**
 * Class WcMembershipPlanOptions.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Integrations;

use Closure;
use WC_Product;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\Exceptions\MissingArgumentException;

/**
 * Class WcMembershipPlanOptions handles the membership plan options for WooCommerce.
 *
 * This class integrates additional custom fields and options into WooCommerce membership plans.
 * It manages the necessary tabs, metadata registration, and rendering for membership plan options.
 */
class WcMembershipPlanOptions extends ItemsIntegration {

	/**
	 * ID of the custom fields options instance.
	 *
	 * @var string
	 */
	public readonly string $id;

	/**
	 * Currently edited Membership Plan ID.
	 *
	 * @var int
	 */
	public int $membership_plan_id;

	/**
	 * Tab definition where custom fields will be created.
	 *
	 * @var array
	 */
	public readonly array $tab;

	/**
	 * The capability required for custom fields to be displayed to the user.
	 *
	 * @var string
	 */
	public readonly string $capability;

	/**
	 * The function to be called to output the content for this page.
	 *
	 * @var Closure|array|string|null
	 */
	public readonly Closure|array|string|null $callback;

	/**
	 * Generated hook suffix of the page.
	 *
	 * @var string
	 */
	public readonly string $hook_suffix;

	/**
	 * Hook priority.
	 *
	 * @var int
	 */
	public readonly int $hook_priority;

	/**
	 * Help tabs displayed on the screen.
	 *
	 * @var array
	 */
	public readonly array $help_tabs;

	/**
	 * Text for the help sidebar to be added to the settings page.
	 *
	 * @var string
	 */
	public readonly string $help_sidebar;

	/**
	 * Callback that returns boolean that defines if custom fields should be shown.
	 *
	 * @var callable|null
	 */
	public $display;

	/**
	 * Meta key used to store the custom fields values.
	 *
	 * @var string
	 */
	public readonly string $option_name;

	/**
	 * List of the fields to be shown.
	 *
	 * @var array
	 */
	public readonly array $items;

	/**
	 * List of the sections to be defined.
	 *
	 * @var array
	 */
	public readonly array $sections;

	/**
	 * Tabs used for the custom fields.
	 *
	 * @var array
	 */
	public readonly array $tabs;

	/**
	 * Defines if the current tab is a new tab.
	 *
	 * @var bool
	 */
	public bool $is_new_tab;

	/**
	 * Constructor method for initializing class with provided arguments and custom fields.
	 *
	 * @param array        $args Arguments for setup, including 'tab' and 'items' as required parameters.
	 * @param CustomFields $custom_fields Instance of the CustomFields class to handle custom fields.
	 *
	 * @throws MissingArgumentException Missing Argument.
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
		$this->option_name   = $args['meta_key'] ?? '';
		$this->tabs          = $args['tabs'] ?? array();
		$this->is_new_tab    = false;

		$tab = $args['tab'] ?? array();

		if ( empty( $tab['label'] ) ) {
			throw new MissingArgumentException(
				sprintf(
				/* translators: %1$s is the class name. */
					esc_html( __( 'Missing argument $tab["label"] in class %1$s.', 'wpify-custom-fields' ) ),
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
					'wc_membership_plan_options',
					$this->tab['id'],
					sanitize_title( $this->tab['label'] ),
					$this->hook_priority,
				),
			),
		);

		add_filter( 'wc_membership_plan_data_tabs', array( $this, 'wc_membership_plan_data_tabs' ), 98 );
		add_action( 'wc_membership_plan_data_panels', array( $this, 'render_data_panels' ) );
		add_action(
			'wc_membership_plan_options_' . $this->tab['target'] ?? $this->tab['id'],
			array(
				$this,
				'render',
			)
		);
		add_action( 'wc_memberships_save_meta_box', array( $this, 'save' ) );
		add_action( 'init', array( $this, 'register_meta' ), $this->hook_priority );
	}

	/**
	 * Updates or adds membership plan data tabs.
	 *
	 * @param array $tabs The existing tabs.
	 *
	 * @return array The modified tabs.
	 */
	public function wc_membership_plan_data_tabs( array $tabs ): array {
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
	 * Renders the data panels for the membership plan.
	 *
	 * This method outputs the HTML for the data panels and triggers the associated actions for the specified tab target.
	 *
	 * @return void
	 */
	public function render_data_panels(): void {
		?>
		<div id="<?php echo esc_attr( $this->tab['target'] ); ?>" class="panel woocommerce_options_panel">
			<?php
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
			do_action( 'wc_membership_plan_options_' . $this->tab['target'] );
			?>
		</div>
		<?php
	}

	/**
	 * Renders the membership plan product options and associated form fields.
	 *
	 * @return void
	 */
	public function render(): void {
		if ( ! current_user_can( $this->capability ) ) {
			return;
		}

		global $post;

		$this->membership_plan_id = $post->ID;
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

	/**
	 * Retrieves the product associated with the item.
	 *
	 * @return bool|WC_Product|null The retrieved product, false if not found, or null on failure.
	 */
	public function get_product(): bool|WC_Product|null {
		return wc_get_product( $this->get_item_id() );
	}

	/**
	 * Saves the membership plan data.
	 *
	 * @param array $data Data from the form.
	 *
	 * @return void
	 */
	public function save( array $data ): void {
		$items                    = $this->normalize_items( $this->items );
		$this->membership_plan_id = $data['post_ID'];

		if ( ! $this->membership_plan_id ) {
			return;
		}

		foreach ( $items as $item ) {
			// Nonce already verified by WordPress.
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
	}

	/**
	 * Registers meta fields for a custom post type 'product'.
	 *
	 * This method normalizes and registers each item as a post meta
	 * for the 'product' post type, setting various properties such as type,
	 * description, default value, and sanitize callback.
	 *
	 * @return void
	 */
	public function register_meta(): void {
		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			register_post_meta(
				'product',
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

	/**
	 * Retrieves an option value for a given post meta field.
	 *
	 * @param string $name The name of the meta field.
	 * @param mixed  $default_value The default value to return if the meta field does not exist.
	 *
	 * @return mixed The value of the meta field or the default value if the field does not exist.
	 */
	public function get_option_value( string $name, mixed $default_value ): mixed {
		return get_post_meta( $this->get_item_id(), $name, true ) ?? $default_value;
	}

	/**
	 * Sets the value of a specified option.
	 *
	 * @param string $name The name of the option to be set.
	 * @param mixed  $value The value to set for the option.
	 *
	 * @return bool|int True on success, false on failure.
	 */
	public function set_option_value( string $name, mixed $value ): bool|int {
		return update_post_meta( $this->get_item_id(), $name, $value );
	}

	/**
	 * Retrieves the membership plan item ID.
	 *
	 * @return int The membership plan item ID.
	 */
	public function get_item_id(): int {
		return $this->membership_plan_id;
	}
}
