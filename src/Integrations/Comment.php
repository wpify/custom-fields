<?php

namespace Wpify\CustomFields\Integrations;

use WP_Comment;
use Wpify\CustomFields\CustomFields;

class Comment extends Integration {
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
	public readonly array  $tabs;
	public readonly array  $items;

	public function __construct(
		array $args,
		CustomFields $custom_fields,
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
			$wp_type          = apply_filters( 'wpifycf_field_type_' . $item['type'], 'string', $item );
			$wp_default_value = apply_filters( 'wpifycf_field_' . $wp_type . '_default_value', '', $item );
			$sanitizer        = fn( $value ) => apply_filters( 'wpifycf_sanitize_field_type_' . $item['type'], $value, $item );

			foreach ( $this->post_types as $post_type ) {
				register_post_meta(
					$post_type,
					$item['id'],
					array(
						'type'              => $wp_type,
						'description'       => $item['label'],
						'single'            => true,
						'default'           => $item['default'] ?? $wp_default_value,
						'sanitize_callback' => $sanitizer,
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

	public function get_field( string $name, $item = array() ) {
		if ( ! empty( $item['callback_get'] ) ) {
			return call_user_func( $item['callback_get'], $item, $this->comment_id );
		} else {
			return get_comment_meta( $this->comment_id, $name, true );
		}
	}

	public function set_field( string $name, $value, $item = array() ) {
		if ( ! empty( $item['callback_set'] ) ) {
			return call_user_func( $item['callback_set'], $item, $this->comment_id, $value );
		} else {
			return update_comment_meta( $this->comment_id, $name, wp_slash( $value ) );
		}
	}
}
