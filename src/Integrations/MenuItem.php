<?php
/**
 * Class MenuItem.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Integrations;

use WP_Screen;
use Wpify\CustomFields\CustomFields;

/**
 * Class MenuItem
 *
 * Represents a menu item and integrates with custom fields.
 */
class MenuItem extends ItemsIntegration {

	/**
	 * ID of the custom fields options instance.
	 *
	 * @var string
	 */
	public readonly string $id;

	/**
	 * Currently edited Menu Item ID.
	 *
	 * @var string
	 */
	public string $item_id;

	/**
	 * Tabs used for the custom fields.
	 *
	 * @var array
	 */
	public readonly array $tabs;

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
	 * Constructor for the class.
	 *
	 * @param array        $args Array of arguments for initializing the object.
	 * @param CustomFields $custom_fields Instance of the CustomFields class.
	 *
	 * @return void
	 */
	public function __construct(
		array $args,
		CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );

		$this->id          = $args['id'] ?? 'menu_item__' . wp_generate_uuid4();
		$this->tabs        = $args['tabs'] ?? array();
		$this->option_name = $args['meta_key'] ?? '';
		$this->items       = $args['items'] ?? array();

		add_action( 'wp_nav_menu_item_custom_fields', array( $this, 'render' ) );
		add_action( 'wp_update_nav_menu_item', array( $this, 'save' ), 10, 2 );
		add_action( 'current_screen', array( $this, 'maybe_enqueue' ) );
	}

	/**
	 * Maybe enqueue scripts and styles based on the current screen.
	 *
	 * @param WP_Screen $current_screen The current screen object.
	 *
	 * @return void
	 */
	public function maybe_enqueue( WP_Screen $current_screen ): void {
		if ( 'nav-menus' !== $current_screen->id ) {
			return;
		}

		$this->enqueue();
	}

	/**
	 * Renders the menu item with the specified configurations.
	 *
	 * @param string $item_id The ID of the menu item.
	 *
	 * @return void
	 */
	public function render( string $item_id ): void {
		$this->item_id = $item_id;
		$this->enqueue();
		$this->print_app(
			'menu-item',
			$this->tabs,
			array( 'loop' => $item_id ),
		);

		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			$this->print_field(
				$item,
				array( 'loop' => $item_id ),
			);
		}
	}

	/**
	 * Saves the menu item with the specified configurations.
	 *
	 * @param int $menu_id The ID of the menu.
	 * @param int $menu_item_db_id The ID of the menu item in the database.
	 *
	 * @return void
	 */
	public function save( int $menu_id, int $menu_item_db_id ): void {
		$this->item_id = $menu_item_db_id;
		$items         = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			// Nonce verification is already done by WordPress.
			// phpcs:ignore WordPress.Security.NonceVerification.Missing
			if ( ! isset( $_POST[ $item['id'] ][ $menu_item_db_id ] ) ) {
				continue;
			}

			$this->set_field(
				$item['id'],
				$this->get_sanitized_post_item_value( $item, $menu_item_db_id ),
				$item,
			);
		}
	}

	/**
	 * Retrieves the value of a specified option, or returns a default value if the option is not set.
	 *
	 * @param string $name The name of the option to retrieve.
	 * @param mixed  $default_value The default value to return if the option is not set.
	 */
	public function get_option_value( string $name, mixed $default_value ): mixed {
		return get_post_meta( $this->get_item_id(), $name, true ) ?? $default_value;
	}

	/**
	 * Sets the value of a specified option.
	 *
	 * @param string $name The name of the option to set.
	 * @param mixed  $value The value to set for the option.
	 *
	 * @return bool True on success, false on failure.
	 */
	public function set_option_value( string $name, mixed $value ): bool {
		return update_post_meta( $this->get_item_id(), $name, $value );
	}

	/**
	 * Retrieves the ID of the item.
	 *
	 * @return int The ID of the item.
	 */
	public function get_item_id(): int {
		return $this->item_id;
	}
}
