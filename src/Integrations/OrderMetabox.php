<?php
/**
 * Class OrderMetabox.
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
 * Class OrderMetabox
 *
 * Handles the creation, display, and saving of order metaboxes in WooCommerce.
 */
class OrderMetabox extends ItemsIntegration {

	/**
	 * Meta box ID (used in the 'id' attribute for the meta box).
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
	 * Capability needed for displaying the metabox.
	 *
	 * @var string
	 */
	public readonly string $capability;

	/**
	 * Function that fills the box with the desired content.
	 * The function should echo its output.
	 *
	 * @var Closure|array|string|null
	 */
	public readonly Closure|array|string|null $callback;

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
	 * Tabs used for the custom fields.
	 *
	 * @var array
	 */
	public readonly array $tabs;

	/**
	 * Generated nonce value.
	 *
	 * @var string
	 */
	public readonly string $nonce;

	/**
	 * Constructor for the class.
	 *
	 * @param array        $args Configuration arguments including 'items', 'title', and other optional settings.
	 * @param CustomFields $custom_fields Instance of CustomFields.
	 *
	 * @return void
	 * @throws MissingArgumentException If required arguments are missing.
	 */
	public function __construct(
		array $args,
		public CustomFields $custom_fields,
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

		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
		add_action( 'woocommerce_update_order', array( $this, 'save' ) );
	}


	/**
	 * Adds a meta box to the specified post type.
	 *
	 * @param string $post_type The post type to which the meta box will be added.
	 *
	 * @return void
	 */
	public function add_meta_box( string $post_type ): void {
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
			$this->id,
			$this->title,
			array( $this, 'render' ),
			$screen,
			$this->context,
			$this->priority,
		);
	}

	/**
	 * Renders the order meta and associated items.
	 *
	 * @param WC_Order $order Order object.
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
	 * Retrieves the order associated with the current order ID.
	 *
	 * @return bool|WC_Order|WC_Order_Refund Returns the order object if found, or false otherwise.
	 */
	public function get_order(): bool|WC_Order|WC_Order_Refund {
		return wc_get_order( $this->order_id );
	}

	/**
	 * Saves the order metadata and updates the order items.
	 *
	 * @param int $post_id The post ID of the order being saved.
	 *
	 * @return int The post ID after save operation.
	 */
	public function save( int $post_id ): int {
		remove_action( 'woocommerce_update_order', array( $this, 'save' ) );

		if ( ! isset( $_POST[ $this->nonce ] ) ) {
			return $post_id;
		}

		$nonce = sanitize_text_field( wp_unslash( $_POST[ $this->nonce ] ) );

		if ( ! wp_verify_nonce( $nonce, $this->id ) ) {
			return $post_id;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return $post_id;
		}

		$this->order_id = $post_id;
		$items          = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			if ( ! isset( $_POST[ $item['id'] ] ) ) {
				continue;
			}

			$this->set_field(
				$item['id'],
				$this->get_sanitized_post_item_value( $item ),
				$item,
			);
		}

		return $post_id;
	}

	/**
	 * Retrieves the value of a specified option from the order metadata.
	 *
	 * @param string $name The name of the option whose value is to be retrieved.
	 * @param mixed  $default_value The default value to return if the option is not found.
	 *
	 * @return mixed The value of the specified option, or the default value if the option is not found.
	 */
	public function get_option_value( string $name, mixed $default_value ): mixed {
		return $this->get_order()->get_meta( $name ) ?? $default_value;
	}

	/**
	 * Sets the value of a specified option in the order metadata.
	 *
	 * @param string $name The name of the option to set.
	 * @param mixed  $value The value to assign to the specified option.
	 *
	 * @return WC_Order|int Returns true if the metadata was successfully saved, false otherwise.
	 */
	public function set_option_value( string $name, mixed $value ): WC_Order|int {
		$order = $this->get_order();
		$order->update_meta_data( $name, $value );

		return $order->save();
	}

	/**
	 * Retrieves the item ID associated with the order.
	 *
	 * @return int The item ID.
	 */
	public function get_item_id(): int {
		return $this->order_id;
	}
}
