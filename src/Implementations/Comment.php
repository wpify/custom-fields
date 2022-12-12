<?php

namespace Wpify\CustomFields\Implementations;

use WP_Post;
use WP_Screen;
use Wpify\CustomFields\CustomFields;

/**
 * Class Metabox
 *
 * @package CustomFields\Implementations
 */
final class Comment extends AbstractPostImplementation {
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
		$args                = wp_parse_args( $args, array(
			'id'            => null,
			'title'         => null,
			'screen'        => null,
			'context'       => 'advanced',
			'priority'      => 'default',
			'callback_args' => null,
			'items'         => array(),
			'post_id'       => null,
			'init_priority' => 10,
			'display'       => function () {
				return \true;
			},
		) );
		$this->id            = $args['id'];
		$this->title         = $args['title'];
		$this->screen        = $args['screen'];
		$this->context       = $args['context'];
		$this->priority      = $args['priority'];
		$this->callback_args = $args['callback_args'];
		$this->items         = $args['items'];
		$this->nonce         = $args['id'] . '_nonce';
		$this->post_id       = $args['post_id'];
		if ( \is_callable( $args['display'] ) ) {
			$this->display = $args['display'];
		} else {
			$this->display = function () use ( $args ) {
				return $args['display'];
			};
		}
		add_action( 'add_meta_boxes_comment', array( $this, 'add_meta_box' ) );
		add_action( 'edit_comment', array( $this, 'save' ) );
	}

	/**
	 * @return array
	 */
	public function get_items() {
		$items = apply_filters( 'wcf_metabox_items', $this->items,
			array( 'id' => $this->id, 'title' => $this->title, 'screen' => $this->screen, 'context' => $this->context, 'priority' => $this->priority, 'callback_args' => $this->callback_args, 'post_types' => $this->post_types, 'post_id' => $this->post_id ) );

		return $this->prepare_items( $items );
	}

	/**
	 * @return void
	 */
	public function set_wcf_shown( WP_Screen $current_screen ) {
		global $pagenow;
		$this->wcf_shown = 'comment.php' === $pagenow;
	}

	/**
	 */
	public function add_meta_box() {
		$display_callback = $this->display;
		if ( ! \boolval( $display_callback() ) ) {
			return;
		}

		add_meta_box( $this->id, $this->title, array( $this, 'render' ), 'comment', 'normal', $this->priority, $this->callback_args );
	}

	/**
	 * @param WP_Post $post
	 */
	public function render( \WP_Comment $comment ) {
		wp_nonce_field( $this->id, $this->nonce );
		$this->set_post( (int) $comment->comment_ID );
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
		return array( 'object_type' => 'metabox', 'id' => $this->id, 'title' => $this->title, 'screen' => $this->screen, 'context' => $this->context, 'priority' => $this->priority, 'callback_args' => $this->callback_args, 'items' => $this->get_items() );
	}

	/**
	 * @param string $name
	 *
	 * @return mixed
	 */
	public function get_field( $name, $item ) {
		if ( ! empty( $item['callback_get'] ) ) {
			return \call_user_func( $item['callback_get'], $item, $this->post_id );
		} else {
			return get_comment_meta( $this->post_id, $name, \true );
		}
	}

	/**
	 * @param number $post_id
	 *
	 * @return mixed
	 */
	public function save( $comment_id ) {
		if ( ! isset( $_POST[ $this->nonce ] ) ) {
			return $comment_id;
		}
		$nonce = $_POST[ $this->nonce ];
		if ( ! wp_verify_nonce( $nonce, $this->id ) ) {
			return $comment_id;
		}
		$this->set_post( $comment_id );
		foreach ( $this->get_items() as $item ) {
			if ( ! isset( $_POST[ $item['id'] ] ) ) {
				continue;
			}
			$sanitizer = $this->sanitizer->get_sanitizer( $item );
			$value     = $sanitizer( wp_unslash( $_POST[ $item['id'] ] ) );
			$this->set_field( $item['id'], $value, $item );
		}

		return \true;
	}

	/**
	 * @param string $name
	 * @param string $value
	 *
	 * @return bool|int
	 */
	public function set_field( $name, $value, $item ) {
		if ( ! empty( $item['callback_set'] ) ) {
			return \call_user_func( $item['callback_set'], $item, $this->post_id, $value );
		} else {
			return update_comment_meta( $this->post_id, $name, wp_slash( $value ) );
		}
	}
}
