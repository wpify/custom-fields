<?php
/**
 * Class Comment.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Integrations;

use WP_Comment;
use Wpify\CustomFields\CustomFields;

/**
 * Class Comment
 *
 * Provides integration for comment-related items with metadata management,
 * including custom fields and meta boxes within the WordPress comment system.
 */
class Comment extends ItemsIntegration {
	const PRIORITY_HIGH    = 'high';
	const PRIORITY_CORE    = 'core';
	const PRIORITY_LOW     = 'low';
	const PRIORITY_DEFAULT = 'default';

	/**
	 * Meta box ID (used in the 'id' attribute for the meta box).
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
	 * ID of the current comment.
	 *
	 * @var int
	 */
	public readonly int $comment_id;

	/**
	 * Generated nonce.
	 *
	 * @var string
	 */
	public readonly string $nonce;

	/**
	 * Meta key used to store the custom fields values.
	 *
	 * @var string
	 */
	public readonly string $option_name;

	/**
	 * Tabs used for the custom fields.
	 *
	 * @var array
	 */
	public readonly array $tabs;

	/**
	 * List of the fields to be shown.
	 *
	 * @var array
	 */
	public readonly array $items;

	/**
	 * Constructor method for initializing the object with given arguments and custom fields.
	 *
	 * @param array        $args Array of arguments used to initialize the object.
	 * @param CustomFields $custom_fields An instance of the CustomFields class.
	 *
	 * @return void
	 */
	public function __construct(
		array $args,
		private readonly CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );

		$this->title         = $args['title'] ?? '';
		$this->priority      = $args['priority'] ?? self::PRIORITY_DEFAULT;
		$this->callback_args = $args['callback_args'] ?? array();
		$this->id            = $args['id'] ?? sanitize_title(
			join(
				'_',
				array(
					$this->title,
					'comment',
					$this->priority,
				),
			),
		);
		$this->nonce         = $this->id . '_nonce';
		$this->option_name   = $args['meta_key'] ?? '';
		$this->items         = $args['items'] ?? array();
		$this->tabs          = $args['tabs'] ?? array();

		add_action( 'add_meta_boxes_comment', array( $this, 'add_meta_box' ) );
		add_action( 'edit_comment', array( $this, 'save_meta_box' ), 10, 2 );
	}

	/**
	 * Adds a meta box to the comment editing screen.
	 *
	 * @param WP_Comment $comment The comment object for which the meta box is being added.
	 *
	 * @return void
	 */
	public function add_meta_box( WP_Comment $comment ): void {
		$this->set_comment( $comment->comment_ID );
		add_meta_box(
			$this->id,
			$this->title,
			array( $this, 'render' ),
			'comment',
			'normal',
			$this->priority,
			$this->callback_args,
		);
	}

	/**
	 * Sets the comment ID for the current instance if it has not been set already.
	 *
	 * @param int $comment_id The ID of the comment to set.
	 *
	 * @return void
	 */
	public function set_comment( int $comment_id ): void {
		if ( empty( $this->comment_id ) ) {
			$this->comment_id = $comment_id;
		}
	}

	/**
	 * Saves the meta box data for a given comment.
	 *
	 * @param int   $comment_id The ID of the comment being saved.
	 * @param array $data Array of data to save.
	 *
	 * @return bool|int True on success, comment ID on failure.
	 */
	public function save_meta_box( int $comment_id, array $data ): bool|int {
		if ( ! isset( $_POST[ $this->nonce ] ) ) {
			return $comment_id;
		}

		$nonce = sanitize_text_field( wp_unslash( $_POST[ $this->nonce ] ) );

		if ( ! wp_verify_nonce( $nonce, $this->id ) ) {
			return $comment_id;
		}

		$this->set_comment( $comment_id );

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
	 * Registers metadata for each item in the list of normalized items.
	 *
	 * This method iterates over the items, normalizes them, and registers post metadata
	 * for each post type with detailed settings including type, description, default values,
	 * and sanitization callbacks.
	 *
	 * @return void
	 */
	public function register_meta(): void {
		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			register_meta(
				'comment',
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
	 * Renders the comment form with the normalized items, sets the current comment, enqueues necessary scripts,
	 * prints the application structure, and prints each field.
	 *
	 * @param WP_Comment $comment The comment object for which the form is being rendered.
	 *
	 * @return void
	 */
	public function render( WP_Comment $comment ): void {
		$items = $this->normalize_items( $this->items );

		$this->set_comment( $comment->comment_ID );
		$this->enqueue();
		$this->print_app( 'comment', $this->tabs );

		wp_nonce_field( $this->id, $this->nonce );

		foreach ( $items as $item ) {
			$this->print_field( $item );
		}
	}

	/**
	 * Retrieve the value of a specified option.
	 *
	 * @param string $name The name of the option.
	 * @param mixed  $default_value The default value to return if the option is not found.
	 *
	 * @return mixed The value of the specified option if it exists, otherwise the default value.
	 */
	public function get_option_value( string $name, mixed $default_value ): mixed {
		return get_comment_meta( $this->comment_id, $name, true ) ?? $default_value;
	}

	/**
	 * Set the value for a specified option.
	 *
	 * @param string $name The name of the option.
	 * @param mixed  $value The value to set for the option.
	 * @param array  $item An optional array to specify additional item details.
	 *
	 * @return bool True if the option value was updated successfully, false otherwise.
	 */
	public function set_option_value( string $name, mixed $value, array $item = array() ): bool {
		return update_comment_meta( $this->comment_id, $name, $value );
	}

	/**
	 * Retrieve the item ID.
	 *
	 * @return int The ID of the item.
	 */
	public function get_item_id(): int {
		return $this->comment_id;
	}
}
