<?php
/**
 * Class ProductVariationOptions.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Integrations;

use Closure;
use WC_Product;
use WP_Post;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\exceptions\MissingArgumentException;

/**
 * Class representing Product Variation Options.
 *
 * This class extends the ItemsIntegration and manages the configuration,
 * rendering, and saving of product variation options in WooCommerce.
 *
 * @throws MissingArgumentException If required arguments are missing during initialization.
 */
class ProductVariationOptions extends ItemsIntegration {

	/**
	 * ID of the custom fields options instance.
	 *
	 * @var string
	 */
	public readonly string $id;

	/**
	 * Currently edited Product Variation ID.
	 *
	 * @var int
	 */
	public int $variation_id;

	/**
	 * Tab definition where custom fields will be created.
	 *
	 * @var array
	 */
	public readonly array $tab;

	/**
	 * Show custom fields after 'pricing', 'inventory', 'dimensions' or 'download'.
	 *
	 * @var string
	 */
	public readonly string $after;

	/**
	 * The capability required for custom fields to be displayed to the user.
	 *
	 * @var string
	 */
	public readonly string $capability;

	/**
	 * The function to be called to output the content for this page.
	 *
	 * @var callable|null
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
	 * Constructor for the class.
	 *
	 * This method initializes various properties and sets up necessary actions
	 * and filters for the class. It validates required arguments and throws
	 * exceptions if any required arguments are missing.
	 *
	 * @param array        $args An array of arguments to initialize class properties.
	 * @param CustomFields $custom_fields An instance of CustomFields to be used.
	 *
	 * @return void
	 * @throws MissingArgumentException If required arguments are missing.
	 */
	public function __construct(
		array $args,
		private CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );

		$required = array( 'items' );
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
		$this->after         = $args['after'] ?? '';
		$this->hook_priority = $args['hook_priority'] ?? 10;
		$this->help_tabs     = $args['help_tabs'] ?? array();
		$this->help_sidebar  = $args['help_sidebar'] ?? '';
		$this->option_name   = $args['meta_key'] ?? '';
		$this->items         = $args['items'] ?? array();
		$this->tabs          = $args['tabs'] ?? array();

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

		$this->tab        = $tab;
		$this->is_new_tab = false;
		$this->id         = sanitize_title(
			join(
				'-',
				array(
					'variation-options',
					$this->tab['id'],
					sanitize_title( $this->tab['label'] ),
					$this->hook_priority,
				),
			),
		);

		if ( in_array( $this->after, array( 'pricing', 'inventory', 'dimensions', 'download' ), true ) ) {
			add_action( 'woocommerce_variation_options_' . $this->after, array( $this, 'render' ), 10, 3 );
		} else {
			add_action( 'woocommerce_product_after_variable_attributes', array( $this, 'render' ), 10, 3 );
		}

		add_action( 'woocommerce_save_product_variation', array( $this, 'save' ), 10, 2 );
		add_action( 'init', array( $this, 'register_meta' ), $this->hook_priority );
		add_action( 'admin_footer', array( $this, 'maybe_enqueue' ) );
	}

	/**
	 * Renders the variation options group for the product.
	 *
	 * @param int     $loop The current loop iteration.
	 * @param array   $variation_data Data associated with the variation.
	 * @param WP_Post $variation The WordPress post object for the variation.
	 *
	 * @return void
	 */
	public function render( int $loop, array $variation_data, WP_Post $variation ): void {
		if ( ! current_user_can( $this->capability ) ) {
			return;
		}

		$this->variation_id = $variation->ID;
		$items              = $this->normalize_items( $this->items );

		if ( is_callable( $this->callback ) ) {
			call_user_func( $this->callback );
		}
		?>
		<div class="options_group">
			<?php
			$this->print_app( 'product-variation', $this->tabs, array( 'loop' => $loop ) );

			foreach ( $items as $item ) {
				$this->print_field( $item, array( 'loop' => $loop ), 'div', 'form-field' );
			}
			?>
		</div>
		<?php
	}

	/**
	 * Retrieves the product object associated with the current item ID.
	 *
	 * @return bool|WC_Product|null The product object if found, false if not found, or null in case of failure.
	 */
	public function get_product(): bool|WC_Product|null {
		return wc_get_product( $this->get_item_id() );
	}

	/**
	 * Saves data for a product variation.
	 *
	 * @param int $product_variation_id The ID of the product variation.
	 * @param int $loop The current loop iteration.
	 *
	 * @return void
	 */
	public function save( int $product_variation_id, int $loop ): void {
		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			// Nonce is already verified by WooCommerce.
			// phpcs:ignore WordPress.Security.NonceVerification.Missing
			if ( ! isset( $_POST[ $item['id'] ][ $loop ] ) ) {
				continue;
			}

			$this->variation_id = $product_variation_id;

			$this->set_field(
				$item['id'],
				$this->get_sanitized_post_item_value( $item, $loop ),
				$item,
			);
		}
	}

	/**
	 * Conditionally enqueues scripts or styles based on the current screen.
	 *
	 * If the current screen is a product-related screen, it calls the enqueue method.
	 *
	 * @return void
	 */
	public function maybe_enqueue(): void {
		$current_screen = get_current_screen();
		if ( 'product' === $current_screen->id || 'product_page_product' === $current_screen->id ) {
			$this->enqueue();
		}
	}

	/**
	 * Registers custom meta fields for product variations.
	 *
	 * Normalizes the items and registers each item as a post meta for product variations with specific type, description, and sanitization callbacks.
	 *
	 * @return void
	 */
	public function register_meta(): void {
		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			register_post_meta(
				'product_variation',
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
	 * Retrieves the value of a product option.
	 *
	 * @param string $name The name of the option to retrieve.
	 * @param mixed  $default_value The default value to return if the option is not set.
	 *
	 * @return mixed The value of the specified option or the default value.
	 */
	public function get_option_value( string $name, mixed $default_value ): mixed {
		return $this->get_product()->get_meta( $name ) ?? $default_value;
	}

	/**
	 * Sets the value of a product option and saves the product.
	 *
	 * @param string $name The name of the option to set.
	 * @param mixed  $value The value to set for the option.
	 *
	 * @return bool True if the product was saved successfully, false otherwise.
	 */
	public function set_option_value( string $name, mixed $value ): bool {
		$product = $this->get_product();
		$product->update_meta_data( $name, $value );

		return $product->save();
	}

	/**
	 * Retrieves the ID of the item.
	 *
	 * @return int The ID of the item.
	 */
	public function get_item_id(): int {
		return $this->variation_id;
	}
}
