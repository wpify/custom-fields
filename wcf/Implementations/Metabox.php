<?php

namespace WpifyCustomFields\Implementations;

use WP_Post;
use WpifyCustomFields\Parser;
use WpifyCustomFields\Sanitizer;

final class Metabox extends AbstractPostImplementation {
	/** @var Parser */
	private $parser;

	/** @var Sanitizer */
	private $sanitizer;

	/** @var string */
	private $id;

	/** @var string */
	private $title;

	/** @var string */
	private $screen;

	/** @var mixed */
	private $context;

	/** @var mixed */
	private $priority;

	/** @var mixed */
	private $callback_args;

	/** @var array */
	private $items;

	/** @var array */
	private $post_types;

	/** @var string */
	private $nonce;

	/** @var number */
	private $post_id;

	/**
	 * Metabox constructor.
	 *
	 * @param array $args
	 * @param Parser $parser
	 * @param Sanitizer $sanitizer
	 */
	public function __construct( array $args, Parser $parser, Sanitizer $sanitizer ) {
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
		$this->parser        = $parser;
		$this->sanitizer     = $sanitizer;

		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
		add_action( 'save_post', array( $this, 'save' ) );

		foreach ( $this->items as $item ) {
			foreach ( $this->post_types as $post_type ) {
				$sanitizer = $this->sanitizer->get_sanitizer( $item );

				register_post_meta( $post_type, $item['id'], array(
					'single'            => true,
					'sanitize_callback' => $sanitizer,
				) );
			}
		}
	}

	/**
	 * @param string $post_type
	 */
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

	/**
	 * @param number $post_id
	 */
	public function set_post( $post_id ) {
		$this->post_id = $post_id;
	}

	/**
	 * @return array
	 */
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

	/**
	 * @param string $name
	 *
	 * @return mixed
	 */
	public function get_field( $name ) {
		return get_post_meta( $this->post_id, $name, true );
	}

	/**
	 * @param number $post_id
	 *
	 * @return mixed
	 */
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
			$this->set_field( $item['id'], $_POST[ $item['id'] ] );
		}
	}

	/**
	 * @param string $name
	 * @param string $value
	 *
	 * @return bool|int
	 */
	public function set_field( $name, $value ) {
		return update_post_meta( $this->post_id, $name, $value );
	}
}
