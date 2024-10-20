<?php

namespace Wpify\CustomFields\Integrations;

use WP_Comment;
use Wpify\CustomFields\CustomFields;

class Comment extends ItemsIntegration {
	const PRIORITY_HIGH    = 'high';
	const PRIORITY_CORE    = 'core';
	const PRIORITY_LOW     = 'low';
	const PRIORITY_DEFAULT = 'default';

	public readonly string $id;
	public readonly string $title;
	public readonly string $priority;
	public readonly array  $callback_args;
	public readonly int    $comment_id;
	public readonly string $nonce;
	public readonly array  $post_types;
	public readonly string $option_name;
	public readonly array  $tabs;
	public readonly array  $items;

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
		$this->post_types    = $args['post_types'] ?? array();
		$this->tabs          = $args['tabs'] ?? array();

		add_action( 'add_meta_boxes_comment', array( $this, 'add_meta_box' ) );
		add_action( 'edit_comment', array( $this, 'save_meta_box' ), 10, 2 );
	}

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

	public function set_comment( int $comment_id ): void {
		if ( empty( $this->comment_id ) ) {
			$this->comment_id = $comment_id;
		}
	}

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

	public function get_option_value( string $name, mixed $default_value ) {
		return get_comment_meta( $this->comment_id, $name, true ) ?? $default_value;
	}

	public function set_option_value( string $name, mixed $value, array $item = array() ) {
		return update_comment_meta( $this->comment_id, $name, $value );
	}

	function get_item_id(): int {
		return $this->comment_id;
	}
}
