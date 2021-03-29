<?php

namespace WpifyCustomFields\Implementations;

use WP_Post;

final class Metabox extends AbstractPostImplementation {
	private $id;

	private $title;

	private $screen;

	private $context;

	private $priority;

	private $callback_args;

	private $items;

	private $post_types;

	private $nonce;

	private $post_id;

	public function __construct( array $args ) {
		$args = wp_parse_args( $args, array(
			'id'            => null,
			'title'         => null,
			'screen'        => null,
			'context'       => 'advanced',
			'priority'      => 'default',
			'callback_args' => null,
			'items'         => array(),
			'post_types'    => array(),
			'post_id'       => null,
		) );

		$this->id            = $args['id'];
		$this->title         = $args['title'];
		$this->screen        = $args['screen'];
		$this->context       = $args['context'];
		$this->priority      = $args['priority'];
		$this->callback_args = $args['callback_args'];
		$this->items         = $this->prepare_items( $args['items'] );
		$this->post_types    = $args['post_types'];
		$this->nonce         = $args['id'] . '_nonce';
		$this->post_id       = $args['post_id'];

		$this->setup();
	}

	public function setup() {
		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
		add_action( 'save_post', array( $this, 'save' ) );
	}

	public function add_meta_box( $post_type ) {
		if ( in_array( $post_type, $this->post_types ) ) {
			add_meta_box(
				$this->id,
				$this->title,
				array( $this, 'render' ),
				$this->screen,
				$this->context,
				$this->priority,
				$this->callback_args
			);
		}
	}

	/**
	 * @param WP_Post $post
	 */
	public function render( WP_Post $post ) {
		wp_nonce_field( $this->id, $this->nonce );

		$this->set_post( $post->ID );
		$this->render_fields();
	}

	public function set_post( $post_id ) {
		$this->post_id = $post_id;
	}

	public function get_data() {
		return array(
			'object_type'   => 'metabox',
			'id'            => $this->id,
			'title'         => $this->title,
			'screen'        => $this->screen,
			'context'       => $this->context,
			'priority'      => $this->priority,
			'callback_args' => $this->callback_args,
			'items'         => $this->items,
			'post_types'    => $this->post_types,
		);
	}

	public function get_field( $name ) {
		return get_post_meta( $this->post_id, $name, true );
	}

	public function save( $post_id ) {
		if ( ! isset( $_POST[ $this->nonce ] ) ) {
			return $post_id;
		}

		$nonce = $_POST[ $this->nonce ];

		if ( ! wp_verify_nonce( $nonce, $this->id ) ) {
			return $post_id;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return $post_id;
		}

		if ( ! in_array( $_POST['post_type'], $this->post_types ) ) {
			return $post_id;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return $post_id;
		}

		$this->set_post( $post_id );

		foreach ( $this->items as $item ) {
			$value = $_POST[ $item['name'] ];
			$this->set_field( $item['name'], $value );
		}
	}

	public function set_field( $name, $value ) {
		// TODO: Sanitize the item by it's type
		return update_post_meta( $this->post_id, $name, $value );
	}
}
