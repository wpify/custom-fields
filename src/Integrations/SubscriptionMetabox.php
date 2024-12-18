<?php
/**
 * Class SubscriptionMetabox.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Integrations;

use Automattic\WooCommerce\Internal\DataStores\Orders\CustomOrdersTableController;
use Closure;
use WC_Order;
use WC_Order_Refund;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\Exceptions\MissingArgumentException;

/**
 * Class SubscriptionMetabox
 *
 * This class manages the creation and display of a custom meta box for WooCommerce subscription orders.
 * It integrates with WooCommerce using hooks and provides methods to render, save, and fetch custom fields.
 */
class SubscriptionMetabox extends ItemsIntegration {

	/**
	 * ID of the custom fields options instance.
	 *
	 * @var string
	 */
	public readonly string $id;

	/**
	 * Currently edited Order ID.
	 *
	 * @var int
	 */
	public int $order_id;

	/**
	 * Title of the meta box.
	 *
	 * @var string
	 */
	public readonly string $title;

	/**
	 * The context within the screen where the box should display. Available contexts vary from screen to screen.
	 * Post edit screen contexts include 'normal', 'side', and 'advanced'.
	 *
	 * @var string
	 */
	public readonly string $context;

	/**
	 * The priority within the context where the box should show.
	 * Accepts 'high', 'core', 'default', or 'low'.
	 *
	 * @var string
	 */
	public readonly string $priority;

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
	 * Generated nonce.
	 *
	 * @var string
	 */
	public readonly string $nonce;

	/**
	 * Constructor for initializing the class with custom fields and arguments.
	 *
	 * @param array        $args Array of arguments, including 'items', 'title', 'display', 'context', 'priority', 'meta_key', 'capability', 'callback', and 'tabs'.
	 * @param CustomFields $custom_fields An instance of the CustomFields class.
	 *
	 * @return void
	 * @throws MissingArgumentException If required arguments 'items' or 'title' are missing.
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

		if ( ! defined( 'WP_CLI' ) || false === WP_CLI ) {
			add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
			add_action( 'woocommerce_update_order', array( $this, 'save' ) );
		}
	}

	/**
	 * Adds a meta box to the specified post type screen.
	 *
	 * @param string $post_type The post type to which the meta box is added.
	 *
	 * @return void
	 */
	public function add_meta_box( string $post_type ): void {
		if ( ! $this->display || ! function_exists( 'wc_get_container' ) || ! function_exists( 'wc_get_page_screen_id' ) ) {
			return;
		}

		$screen = wc_get_container()->get( CustomOrdersTableController::class )->custom_orders_table_usage_is_enabled()
			? wc_get_page_screen_id( 'shop-subscription' )
			: 'shop_subscription';

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

	/**
	 * Renders the order meta details.
	 *
	 * @param WC_Order $order The order object containing order details.
	 *
	 * @return void
	 */
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

	/**
	 * Retrieves the order, which could be a standard order or a refund.
	 *
	 * @return bool|WC_Order|WC_Order_Refund Returns the order object on success
	 * or false on failure.
	 */
	public function get_order(): bool|WC_Order|WC_Order_Refund {
		if ( ! function_exists( 'wc_get_order' ) ) {
			return false;
		}

		return wc_get_order( $this->get_item_id() );
	}

	/**
	 * Saves the order details.
	 *
	 * @param int $post_id The ID of the post (order) being saved.
	 *
	 * @return void
	 */
	public function save( int $post_id ): void {
		remove_action( 'woocommerce_update_order', array( $this, 'save' ) );

		if ( ! isset( $_POST[ $this->nonce ] ) ) {
			return;
		}

		$nonce = sanitize_text_field( wp_unslash( $_POST[ $this->nonce ] ) );

		if ( ! wp_verify_nonce( $nonce, $this->id ) ) {
			return;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		$this->order_id = $post_id;
		$this->set_fields_from_post_request( $this->normalize_items( $this->items ) );
	}

	/**
	 * Retrieves the value of a specified option.
	 *
	 * @param string $name The name of the option to retrieve.
	 * @param mixed  $default_value The default value to return if the option is not found.
	 *
	 * @return mixed The value of the specified option, or the default value if the option is not found.
	 */
	public function get_option_value( string $name, mixed $default_value ): mixed {
		return $this->get_order()->get_meta( $name ) ?? $default_value;
	}

	/**
	 * Sets the value of a specified option.
	 *
	 * @param string $name The name of the option to set.
	 * @param mixed  $value The value to set for the specified option.
	 *
	 * @return bool True on success, false on failure.
	 */
	public function set_option_value( string $name, mixed $value ): bool {
		$order = $this->get_order();
		$order->update_meta_data( $name, $value );

		return $order->save();
	}

	/**
	 * Retrieves the item ID.
	 *
	 * @return int The ID of the item.
	 */
	public function get_item_id(): int {
		return $this->order_id;
	}
}
