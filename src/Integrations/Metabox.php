<?php

namespace Wpify\CustomFields\Integrations;

use WP_Post;
use WP_Screen;
use Wpify\CustomFields\CustomFields;

class Metabox extends Integration {
	const CONTEXT_NORMAL   = 'normal';
	const CONTEXT_ADVANCED = 'advanced';
	const CONTEXT_SIDE     = 'side';
	const PRIORITY_HIGH    = 'high';
	const PRIORITY_CORE    = 'core';
	const PRIORITY_LOW     = 'low';
	const PRIORITY_DEFAULT = 'default';

	public readonly string                      $id;
	public readonly string                      $title;
	public readonly null|string|array|WP_Screen $screen;
	public readonly string                      $context;
	public readonly string                      $priority;
	public readonly array                       $callback_args;
	public readonly WP_Post                     $post;
	public readonly string                      $nonce;
	public readonly array                       $post_types;
	public readonly array                       $tabs;
	public readonly array                       $items;

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
		$this->items         = $args['items'] ?? array();
		$this->post_types    = $args['post_types'] ?? array();
		$this->tabs          = $args['tabs'] ?? array();

		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ), 10, 2 );
		add_action( 'save_post', array( $this, 'save_meta_box' ), 10, 2 );
		add_action( 'init', array( $this, 'register_meta' ) );
	}

	public function add_meta_box( string $post_type, WP_Post $post ): void {
		if ( in_array( $post_type, $this->post_types ) ) {
			$this->set_post( $post );
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

	public function set_post( WP_Post $post ): void {
		if ( empty( $this->post ) ) {
			$this->post = $post;
		}
	}

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

		if ( isset( $_POST['post_type'] ) && ! in_array( $_POST['post_type'], $this->post_types ) ) {
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
				// Sanitization is done via filter to enable custom sanitization.
				// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
				apply_filters( 'wpifycf_sanitize_field_type_' . $item['type'], wp_unslash( $_POST[ $item['id'] ] ), $item ),
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

	public function get_field( string $name, $item = array() ) {
		if ( ! empty( $item['callback_get'] ) ) {
			return call_user_func( $item['callback_get'], $item, $this->post->ID );
		} else {
			return get_post_meta( $this->post->ID, $name, true );
		}
	}

	public function set_field( string $name, $value, $item = array() ) {
		if ( ! empty( $item['callback_set'] ) ) {
			return call_user_func( $item['callback_set'], $item, $this->post->ID, $value );
		} else {
			return update_post_meta( $this->post->ID, $name, wp_slash( $value ) );
		}
	}
}
