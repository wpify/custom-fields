<?php
/**
 * Class Metabox.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Integrations;

use WP_Post;
use WP_Screen;
use Wpify\CustomFields\CustomFields;

/**
 * A class that handles the creation and management of custom meta boxes in WordPress.
 */
class Metabox extends ItemsIntegration {
	const CONTEXT_NORMAL   = 'normal';
	const CONTEXT_ADVANCED = 'advanced';
	const CONTEXT_SIDE     = 'side';
	const PRIORITY_HIGH    = 'high';
	const PRIORITY_CORE    = 'core';
	const PRIORITY_LOW     = 'low';
	const PRIORITY_DEFAULT = 'default';


	/**
	 * ID of the custom fields options instance.
	 *
	 * @var string
	 */
	public readonly string $id;

	/**
	 * Title of the meta box.
	 *
	 * @var string
	 */
	public readonly string $title;

	/**
	 * The screen or screens on which to show the box.
	 *
	 * @var string|array|WP_Screen|null
	 */
	public readonly null|string|array|WP_Screen $screen;

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
	 * Data that should be set as the $args property of the box array (which is the second parameter passed to your callback).
	 *
	 * @var array
	 */
	public readonly array $callback_args;

	/**
	 * Currently edited Post.
	 *
	 * @var WP_Post
	 */
	public readonly WP_Post $post;

	/**
	 * Generated nonce value.
	 *
	 * @var string
	 */
	public readonly string $nonce;

	/**
	 * Post Types where to show the custom fields.
	 *
	 * @var array
	 */
	public readonly array $post_types;

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
	 * @param array        $args Array of arguments to initialize the object properties.
	 * @param CustomFields $custom_fields Instance of CustomFields.
	 *
	 * @return void
	 */
	public function __construct(
		array $args,
		CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );

		$this->title         = $args['title'] ?? '';
		$this->screen        = $args['screen'] ?? null;
		$this->context       = $args['context'] ?? self::CONTEXT_NORMAL;
		$this->priority      = $args['priority'] ?? self::PRIORITY_DEFAULT;
		$this->callback_args = $args['callback_args'] ?? array();
		$this->id            = $args['id'] ?? sanitize_title(
			join(
				'_',
				array(
					$this->title,
					$this->screen,
					$this->context,
					$this->priority,
				),
			),
		);
		$this->nonce         = $this->id . '_nonce';
		$this->option_name   = $args['meta_key'] ?? '';
		$this->items         = $args['items'] ?? array();
		$this->post_types    = $args['post_types'] ?? array();
		$this->tabs          = $args['tabs'] ?? array();

		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
		add_action( 'save_post', array( $this, 'save_meta_box' ), 10, 2 );
		add_action( 'init', array( $this, 'register_meta' ) );
	}

	/**
	 * Adds a meta box to the specified post type.
	 *
	 * @param string $post_type The post type to which the meta box should be added.
	 *
	 * @return void
	 */
	public function add_meta_box( string $post_type ): void {
		if ( in_array( $post_type, $this->post_types, true ) ) {
			add_meta_box(
				$this->id,
				$this->title,
				array( $this, 'render' ),
				$post_type,
				$this->context,
				$this->priority,
				$this->callback_args,
			);
		}
	}

	/**
	 * Sets the post property if it is not already set.
	 *
	 * @param WP_Post $post The post object to set.
	 *
	 * @return void
	 */
	public function set_post( WP_Post $post ): void {
		if ( empty( $this->post ) ) {
			$this->post = $post;
		}
	}

	/**
	 * Saves the meta box associated with a given post.
	 *
	 * @param int     $post_id The ID of the post to save the meta box for.
	 * @param WP_Post $post The post object being saved.
	 *
	 * @return bool|int True on successful save, or the post ID if any checks fail.
	 */
	public function save_meta_box( int $post_id, WP_Post $post ): bool|int {
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

		if ( isset( $_POST['post_type'] ) && ! in_array( $_POST['post_type'], $this->post_types, true ) ) {
			return $post_id;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return $post_id;
		}

		$this->set_post( $post );

		$items = $this->normalize_items( $this->items );

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

		return true;
	}

	/**
	 * Registers meta data for specified post types.
	 *
	 * This method normalizes items and registers each item as post meta for the
	 * defined post types. Each item will have its type, description, default
	 * value, and sanitize callback configured.
	 *
	 * @return void
	 */
	public function register_meta(): void {
		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			foreach ( $this->post_types as $post_type ) {
				register_post_meta(
					$post_type,
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
	}

	/**
	 * Renders the metabox for a given post with the necessary components.
	 *
	 * @param WP_Post $post The post object for which the metabox is being rendered.
	 *
	 * @return void
	 */
	public function render( WP_Post $post ): void {
		$items = $this->normalize_items( $this->items );

		$this->set_post( $post );
		$this->enqueue();
		$this->print_app( 'metabox', $this->tabs );

		wp_nonce_field( $this->id, $this->nonce );

		foreach ( $items as $item ) {
			$this->print_field( $item );
		}
	}

	/**
	 * Retrieves the value of a specified option for the current item.
	 *
	 * @param string $name The name of the option to retrieve.
	 * @param mixed  $default_value The default value to return if the option is not found.
	 *
	 * @return mixed The value of the specified option, or the default value if the option does not exist.
	 */
	public function get_option_value( string $name, mixed $default_value ): mixed {
		return get_post_meta( $this->get_item_id(), $name, true ) ?? $default_value;
	}

	/**
	 * Sets the option value for a given item.
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
	 * Retrieves the ID of the current post.
	 *
	 * @return int The ID of the current post.
	 */
	public function get_item_id(): int {
		return $this->post->ID;
	}
}
