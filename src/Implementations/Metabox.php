<?php

namespace Wpify\CustomFields\Implementations;

use WP_Post;
use WP_Screen;
use Wpify\CustomFields\CustomFields;

/**
 * Class Metabox
 * @package CustomFields\Implementations
 */
final class Metabox extends AbstractPostImplementation {
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

	/** @var callable */
	private $display;

	/**
	 * Metabox constructor.
	 *
	 * @param array        $args
	 * @param CustomFields $wcf
	 */
	public function __construct( array $args, CustomFields $wcf ) {
		parent::__construct( $args, $wcf );

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
			'init_priority' => 10,
			'display'       => function () {
				return true;
			},
		) );

		$this->id            = $args['id'];
		$this->title         = $args['title'];
		$this->screen        = $args['screen'];
		$this->context       = $args['context'];
		$this->priority      = $args['priority'];
		$this->callback_args = $args['callback_args'];
		$this->items         = $args['items'];
		$this->post_types    = $args['post_types'];
		$this->nonce         = $args['id'] . '_nonce';
		$this->post_id       = $args['post_id'];

		if ( is_callable( $args['display'] ) ) {
			$this->display = $args['display'];
		} else {
			$this->display = function () use ( $args ) {
				return $args['display'];
			};
		}

		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
		add_action( 'save_post', array( $this, 'save' ) );
		add_action( 'init', array( $this, 'register_meta' ), $args['init_priority'] );
	}

	/**
	 * @return void
	 */
	public function register_meta() {
		$items = $this->get_items();

		foreach ( $items as $item ) {
			foreach ( $this->post_types as $post_type ) {
				register_post_meta( $post_type, $item['id'], array(
					'type'        => $this->get_item_type( $item ),
					'description' => $item['title'],
					'single'      => true,
					'default'     => $item['default'] ?? null,
				) );
			}
		}
	}

	/**
	 * @return array
	 */
	public function get_items() {
		$items = apply_filters( 'wcf_metabox_items', $this->items, array(
			'id'            => $this->id,
			'title'         => $this->title,
			'screen'        => $this->screen,
			'context'       => $this->context,
			'priority'      => $this->priority,
			'callback_args' => $this->callback_args,
			'post_types'    => $this->post_types,
			'post_id'       => $this->post_id,
		) );

		return $this->prepare_items( $items );
	}

	/**
	 * @return void
	 */
	public function set_wcf_shown( WP_Screen $current_screen ) {
		global $pagenow;

		$this->wcf_shown = ( $current_screen->base === 'post'
		                     && in_array( $current_screen->post_type, $this->post_types )
		                     && in_array( $pagenow, array( 'post-new.php', 'post.php' ) ) );
	}

	/**
	 * @param string $post_type
	 */
	public function add_meta_box( $post_type ) {
		$display_callback = $this->display;

		if ( ! boolval( $display_callback() ) ) {
			return;
		}

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
			'items'         => $this->get_items(),
			'post_types'    => $this->post_types,
		);
	}

	/**
	 * @param string $name
	 *
	 * @return mixed
	 */
	public function get_field( $name, $item ) {
		if ( ! empty( $item['callback_get'] ) ) {
			return call_user_func( $item['callback_get'], $item, $this->post_id );
		} else {
			return get_post_meta( $this->post_id, $name, true );
		}
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

		foreach ( $this->get_items() as $item ) {
			if ( ! isset( $_POST[ $item['id'] ] ) ) {
				continue;
			}

			$sanitizer = $this->sanitizer->get_sanitizer( $item );
			$value     = $sanitizer( wp_unslash( $_POST[ $item['id'] ] ) );

			$this->set_field( $item['id'], $value, $item );
		}

		return true;
	}

	/**
	 * @param string $name
	 * @param string $value
	 *
	 * @return bool|int
	 */
	public function set_field( $name, $value, $item ) {
		if ( ! empty( $item['callback_set'] ) ) {
			return call_user_func( $item['callback_set'], $item, $this->post_id, $value );
		} else {
			return update_post_meta( $this->post_id, $name, wp_slash( $value ) );
		}
	}
}
