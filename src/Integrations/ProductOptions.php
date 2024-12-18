<?php
/**
 * Class ProductOptions.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Integrations;

use Closure;
use WC_Product;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\Exceptions\MissingArgumentException;

/**
 * Class ProductOptions
 *
 * Handles product options and custom fields integration for WooCommerce products.
 */
class ProductOptions extends ItemsIntegration {

	/**
	 * ID of the custom fields options instance.
	 *
	 * @var string
	 */
	public readonly string $id;

	/**
	 * Currently edited Product ID.
	 *
	 * @var int
	 */
	public int $product_id;

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
	 * Constructor method for initializing the class.
	 *
	 * @param array        $args Arguments for initializing the class.
	 * @param CustomFields $custom_fields An instance of the CustomFields class.
	 *
	 * @return void
	 *
	 * @throws MissingArgumentException If required arguments are missing.
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

		if ( ! defined( 'WP_CLI' ) || false === WP_CLI ) {
			add_filter( 'woocommerce_product_data_tabs', array( $this, 'woocommerce_product_data_tabs' ), 98 );
			add_action( 'woocommerce_product_data_panels', array( $this, 'render_data_panels' ) );
			add_action(
				'woocommerce_product_options_' . $this->tab['target'] ?? $this->tab['id'],
				array(
					$this,
					'render',
				)
			);
			add_action( 'woocommerce_process_product_meta', array( $this, 'save' ) );
			add_action( 'init', array( $this, 'register_meta' ), $this->hook_priority );
		}
	}

	/**
	 * Modifies the WooCommerce product data tabs by updating existing tabs or adding new custom tabs.
	 *
	 * @param array $tabs An associative array of existing product data tabs.
	 *
	 * @return array The modified array of product data tabs.
	 */
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


	/**
	 * Renders the data panels for WooCommerce product options.
	 *
	 * This method outputs a div element with a specific ID and class, and triggers a custom WooCommerce action
	 * based on the target attribute of the tab.
	 *
	 * @return void No return value.
	 */
	public function render_data_panels(): void {
		?>
		<div id="<?php echo esc_attr( $this->tab['target'] ); ?>" class="panel woocommerce_options_panel">
			<?php
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
			do_action( 'woocommerce_product_options_' . $this->tab['target'] );
			?>
		</div>
		<?php
	}

	/**
	 * Renders the product options UI if the current user has the correct capabilities.
	 *
	 * The method validates the user's capability to render the UI. If validated,
	 * it enqueues necessary assets, normalizes items, and invokes the callback if callable.
	 * Finally, it prints the HTML structure for the product options with associated fields.
	 *
	 * @return void
	 */
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

	/**
	 * Retrieves the WooCommerce product based on the item's ID.
	 *
	 * This method fetches the product using the item's ID and returns the corresponding
	 * WooCommerce product object. If the product cannot be found, it returns null.
	 *
	 * @return bool|WC_Product|null The WooCommerce product object if found, false if the ID is invalid, or null if the product is not found.
	 */
	public function get_product(): bool|WC_Product|null {
		return wc_get_product( $this->get_item_id() );
	}

	/**
	 * Saves the product fields data for a given post.
	 *
	 * This function processes and saves custom fields associated with a product
	 * for the specified post ID. The items are normalized and sanitized before
	 * being stored.
	 *
	 * @param int $post_id The ID of the post being saved.
	 *
	 * @return void
	 */
	public function save( int $post_id ): void {
		$this->product_id = $post_id;

		$this->set_fields_from_post_request( $this->normalize_items( $this->items ) );
	}

	/**
	 * Registers custom metadata for the products.
	 *
	 * This method normalizes the defined items and registers each as post meta for 'product'.
	 * It sets the meta properties such as type, description, default value, and sanitize callback.
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
	 * Retrieves an option value from the product meta data.
	 *
	 * @param string $name The name of the meta key to retrieve.
	 * @param mixed  $default_value The default value to return if the meta key does not exist.
	 *
	 * @return mixed The value of the meta key if it exists, otherwise the default value.
	 */
	public function get_option_value( string $name, mixed $default_value ): mixed {
		return $this->get_product()->get_meta( $name ) ?? $default_value;
	}

	/**
	 * Sets an option value in the product meta data.
	 *
	 * @param string $name The name of the meta key to set.
	 * @param mixed  $value The value to be set for the meta key.
	 *
	 * @return bool True on success, false on failure.
	 */
	public function set_option_value( string $name, mixed $value ): bool {
		$product = $this->get_product();
		$product->update_meta_data( $name, $value );

		return $product->save();
	}

	/**
	 * Retrieves the item ID of the product.
	 *
	 * @return int The product's item ID.
	 */
	public function get_item_id(): int {
		return $this->product_id;
	}
}
