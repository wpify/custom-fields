<?php

namespace Wpify\CustomFields\Integrations;

use stdClass;
use WP_Post;
use WP_Screen;
use Wpify\CustomFields\CustomFields;

class MenuItem extends Integration {

	public readonly string $id;
	public string $item_id;
	public readonly array $tabs;
	public readonly array $items;

	public function __construct(
		array $args,
		CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );

		$this->id    = $args['id'] ?? 'menu_item__' . wp_generate_uuid4();
		$this->tabs  = $args['tabs'] ?? array();
		$this->items = $args['items'] ?? array();

		add_action( 'wp_nav_menu_item_custom_fields', array( $this, 'render' ), 10, 5 );
		add_action( 'wp_update_nav_menu_item', array( $this, 'save' ), 10, 3 );
		add_action( 'current_screen', array( $this, 'maybe_enqueue' ) );
	}

	public function maybe_enqueue( WP_Screen $current_screen ): void {
		if ( 'nav-menus' !== $current_screen->id ) {
			return;
		}

		$this->enqueue();
	}

	public function render( string $item_id, WP_Post $menu_item, int $depth, stdClass|null $args, int $current_object_id ) {
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

	public function save( int $menu_id, int $menu_item_db_id, array $args ) {
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

	public function get_field( string $name, $item = array() ): mixed {
		if ( ! empty( $item['callback_get'] ) ) {
			return call_user_func( $item['callback_get'], $item, $this->item_id );
		} else {
			return get_post_meta( $this->item_id, $name, true );
		}
	}

	public function set_field( string $name, $value, $item = array() ) {
		if ( ! empty( $item['callback_set'] ) ) {
			return call_user_func( $item['callback_set'], $item, $this->item_id, $value );
		} else {
			return update_post_meta( $this->item_id, $name, $value );
		}
	}
}
