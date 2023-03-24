<?php

namespace Wpify\CustomFields\Implementations;

use WP_Query;
use WP_Screen;
use Wpify\CustomFields\Api;
use Wpify\CustomFields\Parser;
use Wpify\CustomFields\Sanitizer;
use Wpify\CustomFields\CustomFields;

/**
 * Class AbstractImplementation
 * @package CustomFields\Implementations
 */
abstract class AbstractImplementation {
	/** @var string */
	protected $implementation_id;

	/** @var Parser */
	protected $parser;

	/** @var Sanitizer */
	protected $sanitizer;

	/** @var Api */
	protected $api;

	/** @var CustomFields */
	protected $wcf;

	/** @var bool */
	protected $wcf_shown = false;

	/** @var string */
	protected $script_handle = '';

	private $build_url;
	public function __construct( array $args, CustomFields $wcf ) {
		$this->wcf               = $wcf;
		$this->parser            = $wcf->get_parser();
		$this->sanitizer         = $wcf->get_sanitizer();
		$this->api               = $wcf->get_api();
		$this->implementation_id = $this->unique_id( $args );

		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_action( 'current_screen', array( $this, 'set_wcf_shown' ) );
	}

	/**
	 * @return void
	 */
	public function admin_enqueue_scripts() {
		if ( $this->wcf_shown ) {
			// Enqueue all dependencies needed for TinyMCE editor
			wp_enqueue_script( 'wp-block-library' );
			wp_tinymce_inline_scripts();

			// Enqueue all dependencees needed for code editor
			wp_enqueue_editor();
			wp_enqueue_code_editor( array( 'type' => 'text/html' ) );

			// Enqueue dependencies needed for media library
			wp_enqueue_media();

			// Enqueue dependencies for WPify Custom Fields
			$this->wcf->get_assets()->enqueue_style(
				'wpify-custom-fields.css',
				array( 'wp-components' )
			);

			$this->script_handle = $this->wcf->get_assets()->enqueue_script(
				'wpify-custom-fields.js',
				array( 'wp-tinymce' ),
				true,
				array(
					'wcf_code_editor_settings' => $this->wcf->get_assets()->get_code_editor_settings(),
					'wcf_build_url'            => $this->get_build_url(),
					'wcf_date'                 => array(
						'date_format' => get_option( 'date_format' ),
						'time_format' => get_option( 'time_format' ),
					),
				)
			);
		}
	}

	public function get_build_url() {
		if (!$this->build_url) {
			$this->build_url = $this->wcf->get_assets()->path_to_url( $this->wcf->get_assets()->get_assets_path() );
		}
		return $this->build_url;
	}

	/**
	 * @param string $name
	 * @param string $value
	 *
	 * @return mixed
	 */
	abstract public function set_field( $name, $value, $field );

	/**
	 * @param string $object_type
	 * @param string $tag
	 * @param array $attributes
	 */
	public function render_fields( string $object_type = '', string $tag = 'div', array $attributes = array() ) {
		$data = $this->get_data();

		if ( ! empty( $object_type ) ) {
			$data['object_type'] = $object_type;
		}

		$data          = $this->fill_values( $data );
		$data['items'] = $this->fill_selects( $data['items'] );
		$data['api']   = array(
			'url'   => $this->api->get_rest_url(),
			'nonce' => $this->api->get_rest_nonce(),
			'path'  => $this->api->get_rest_path(),
		);

		$class = empty( $attributes['class'] ) ? 'js-wcf' : 'js-wcf ' . $attributes['class'];
		$json  = wp_json_encode( $data, JSON_UNESCAPED_UNICODE );
		$hash  = 'd' . md5( $json );

		do_action( 'wcf_before_fields', $data );
		$script = 'try{window.wcf_data=(window.wcf_data||{});window.wcf_data.' . $hash . '=' . $json . ';}catch(e){console.error(e);}';
		echo '<script type="text/javascript">' . $script . '</script>';
		echo '<' . $tag . ' class="' . esc_attr( $class ) . '" data-hash="' . esc_attr( $hash ) . '" data-loaded="false"></' . $tag . '>';
		do_action( 'wcf_after_fields', $data );
	}

	public function query_posts( $args ) {
		$query = new WP_Query( $args );
		$posts = array();

		while ( $query->have_posts() ) {
			$query->the_post();
			global $post;
			$posts[] = $post;
		}

		wp_reset_postdata();

		return $posts;
	}

	public function get_post_options( $args = null ) {
		if ( empty( $args['value'] ) ) {
			$args['value'] = array();
		}

		if ( is_string( $args['value'] ) ) {
			$args['value'] = json_decode( $args['value'] );
		}

		if ( ! is_array( $args['value'] ) ) {
			$args['value'] = array( $args['value'] );
		}

		$args['value']      = array_filter( $args['value'] );
		$args['query_args'] = $args['query_args'] ?? array();

		$query_args = wp_parse_args( $args['query_args'], array(
			'posts_per_page'      => empty( $args['search'] ) ? 100 : - 1,
			'post_type'           => $args['post_type'] ?? array( 'post' ),
			'ignore_sticky_posts' => true,
		) );

		if ( ! empty( $args['search'] ) ) {
			$query_args['s']       = $args['search'];
			$query_args['orderby'] = 'relevance';
		} elseif ( ! empty( $args['value'] ) ) {
			$query_args['post__in'] = $args['value'];
			$query_args['orderby']  = 'post__in';
		}

		$posts    = $this->query_posts( $query_args );
		$post_ids = array_map( function ( $post ) {
			return $post->ID;
		}, $posts );

		$args['post__not_in'] = array_map( function ( $post ) {
			return $post->ID;
		}, $posts );

		unset( $query_args['post__in'] );
		unset( $query_args['orderby'] );
		unset( $query_args['s'] );

		foreach ( $this->query_posts( $query_args ) as $post ) {
			if ( ! in_array( $post->ID, $post_ids ) ) {
				$posts[] = $post;
			}
		}

		return array_map( function ( $post ) {
			return array(
				'value'     => $post->ID,
				'label'     => get_the_title( $post ) . ' (ID ' . $post->ID . ')',
				'excerpt'   => get_the_excerpt( $post ),
				'thumbnail' => get_the_post_thumbnail_url( $post ),
				'permalink' => get_permalink( $post ),
			);
		}, $posts );
	}

	public function fill_selects( $items, $prefix = null, $fill_options = true ) {
		foreach ( $items as $key => $item ) {
			if ( in_array( $item['type'], array( 'post', 'multi_post', 'link' ) ) && empty( $item['options'] ) ) {
				$items[ $key ]['options'] = array( $this, 'get_post_options' );
			}

			if ( ! empty( $item['list_id'] ) ) {
				$id = ( $prefix ?? $this->implementation_id ) . ':' . $item['list_id'];
			} else {
				$id = ( $prefix ?? $this->implementation_id ) . ':' . $item['id'];
			}

			if ( isset( $items[ $key ]['options'] ) && is_callable( $items[ $key ]['options'] ) ) {
				$callback = $items[ $key ]['options'];

				if ( ! empty( $item['async'] ) ) {
					$items[ $key ]['options'] = $id;
					$this->wcf->set_api_callback( $items[ $key ]['options'], $callback );
				} elseif ( $fill_options ) {
					$items[ $key ]['options'] = $callback( $item );
				}
			} elseif ( isset( $items[ $key ]['options'] ) && is_array( $items[ $key ]['options'] ) && ! empty( $item['async'] ) ) {
				$items[ $key ]['options'] = $id;
				$this->wcf->set_api_callback( $items[ $key ]['options'], function ( $args ) use ( $item ) {
					if ( ! empty( $args['search'] ) ) {
						return array_filter( $item['options'], function ( $option ) use ( $args ) {
							return $this->search_in_string( $option['label'] ?? '', $args['search'] )
							       || $this->search_in_string( $option['value'] ?? '', $args['search'] )
							       || $this->search_in_string( $option['excerpt'] ?? '', $args['search'] );
						} );
					}

					return $item['options'];
				} );
			}

			if ( ! empty( $item['items'] ) ) {
				$items[ $key ]['items'] = $this->fill_selects( $item['items'], $id, $fill_options );
			}
		}

		return $items;
	}

	/**
	 * @param $input
	 *
	 * @return array
	 */
	public function normalize_for_search( $input = '' ): array {
		return explode( ' ', trim( preg_replace( '/\s+/m', ' ', strtolower( remove_accents( strval( $input ) ) ) ) ) );
	}

	public function search_in_string( $haystack, $needle ) {
		$haystack = $this->normalize_for_search( $haystack );
		$needle   = $this->normalize_for_search( $needle );

		$matched = array_map( function ( $needle_word ) use ( $haystack ) {
			foreach ( $haystack as $haystack_word ) {
				if ( strpos( $haystack_word, $needle_word ) !== false ) {
					return true;
				}
			}

			return false;
		}, $needle );

		foreach ( $matched as $is_matched ) {
			if ( ! $is_matched ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @return array
	 */
	abstract public function get_data();

	/**
	 * @param array $definition
	 *
	 * @return array
	 */
	protected function fill_values( array $definition ) {
		foreach ( $definition['items'] as $key => $item ) {
			$value = $this->get_field( $item['id'], $item );
			$value = $this->parse_value( $value, $item );

			if ( ! empty( $definition['items'][ $key ]['items'] ) ) {
				$definition['items'][ $key ]['items'] = array_filter( array_map(
					array( $this, 'normalize_item' ),
					$definition['items'][ $key ]['items']
				) );
			}

			if ( empty( $value ) ) {
				$definition['items'][ $key ]['value'] = '';
			} else {
				$definition['items'][ $key ]['value'] = $value;
			}
		}

		return $definition;
	}

	/**
	 * @param string $value
	 * @param array $item
	 *
	 * @return mixed|void
	 */
	protected function parse_value( $value, $item = array() ) {
		$parser = $this->parser->get_parser( $item );

		return $parser( $value );
	}

	/**
	 * @param string $name
	 *
	 * @return mixed
	 */
	abstract public function get_field( string $name, array $item );

	abstract public function set_wcf_shown( WP_Screen $current_screen );

	/**
	 * @param array $item
	 *
	 * @return string
	 */
	public function get_item_type( array $item ) {
		switch ( $item['type'] ) {
			case 'number':
				return 'number';
			case 'attachment':
			case 'post':
				return 'integer';
			case 'multi_attachment':
			case 'multi_group':
			case 'multi_post':
			case 'multi_select':
	        case 'multi_checkbox':
	        case 'multi_toggle':
				return 'array';
			case 'group':
			case 'link':
			case 'mapycz':
				return 'object';
			case 'checkbox':
			case 'toggle':
				return 'boolean';
			default:
				return 'string';
		}
	}

	/**
	 * @param array $items
	 *
	 * @return array
	 */
	protected function prepare_items( array $items = array() ) {
		foreach ( $items as $key => $item ) {
			$items[ $key ] = $this->normalize_item( $item );
		}

		return array_values( array_filter( $items ) );
	}

	/**
	 * @param array $args
	 *
	 * @return array
	 */
	private function normalize_item( array $args = array() ) {
		$args = wp_parse_args( $args, array(
			'type'              => '',
			'id'                => '',
			'title'             => '',
			'class'             => '',
			'css'               => '',
			'default'           => '',
			'desc'              => '',
			'desc_tip'          => '',
			'placeholder'       => '',
			'suffix'            => '',
			'value'             => '',
			'custom_attributes' => array(),
			'description'       => '',
			'tooltip_html'      => '',
		) );

		/* Compatibility with WPify Woo */
		$type_aliases = array(
			'multiswitch'     => 'multi_toggle',
			'switch'          => 'toggle',
			'multiselect'     => 'multi_select',
			'colorpicker'     => 'color',
			'react_component' => 'react',
		);

		foreach ( $type_aliases as $alias => $correct ) {
			if ( $args['type'] === $alias ) {
				$args['type'] = $correct;
			}
		}

		if ( in_array( $args['type'], array( 'number', 'post', 'attachment' ) ) && empty( $args['default'] ) ) {
			$args['default'] = 0;
		}

		if ( in_array( $args['type'], array(
				'group',
				'multi_group',
				'multi_post',
				'multi_attachment',
				'multi_toggle',
				'multi_select',
				'link'
			) ) && empty( $args['default'] ) ) {
			$args['default'] = array();
		}

		if ( in_array( $args['type'], array( 'toggle', 'checkbox' ) ) && empty( $args['default'] ) ) {
			$args['default'] = false;
		}

		if ( ! empty( $args['post_type'] ) ) {
			$args['async'] = $args['async'] ?? true;

			if ( is_string( $args['post_type'] ) ) {
				$args['post_type'] = array( $args['post_type'] );
			}

			$post_type_names = array();

			foreach ( $args['post_type'] as $post_type ) {
				$post_type         = get_post_type_object( $post_type );
				$post_type_names[] = empty( $post_type->labels->singular_name )
					? __( 'Item', 'wpify-custom-fields' )
					: $post_type->labels->singular_name;
			}

			$args['post_type_name'] = join( ', ', $post_type_names );
		}

		$args_aliases = array(
			'label'           => 'title',
			'desc'            => 'description',
			'async_list_type' => 'list_type',
		);

		foreach ( $args_aliases as $alias => $correct ) {
			if ( empty( $args[ $correct ] ) && ! empty( $args[ $alias ] ) ) {
				$args[ $correct ] = $args[ $alias ];
			}
		}

		if ( $args['type'] === 'group' && isset( $args['multi'] ) && $args['multi'] === true ) {
			$args['type'] = 'multi_group';
			unset( $args['multi'] );
		}

		if ( ! empty( $args['items'] ) && is_array( $args['items'] ) ) {
			foreach ( $args['items'] as $key => $item ) {
				$args['items'][ $key ] = $this->normalize_item( $item );
			}

			$args['items'] = array_values( array_filter( $args['items'] ) );
		}

		if ( 'group' === $args['type'] ) {
			$default = empty( $args['default'] ) ? array() : $args['default'];

			foreach ( $args['items'] as $item ) {
				$item_id                     = $item['id'];
				$args['default'][ $item_id ] = $item['default'] ?? $default[ $item_id ] ?? '';
			}
		}

		if (
			(
				isset( $args['display'] )
				&& is_callable( $args['display'] )
				&& $args['display']( $args, $this ) === false
			) || (
				isset( $args['display'] )
				&& $args['display'] === false
			)
		) {
			return null;
		}

		return $args;
	}

	public function unique_id( $data, $prefix = '' ): string {
		unset( $data['items'] );
		unset( $data['render_callback'] );
		unset( $data['display'] );

		ob_start();
		var_dump( $data, $prefix );

		return md5( ob_get_clean() );
	}

	public function register_selects() {
		$data = $this->get_data();

		$this->fill_selects( $data['items'] );
	}
}
