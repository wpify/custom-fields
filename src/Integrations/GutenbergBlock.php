<?php

namespace Wpify\CustomFields\Integrations;

use Closure;
use WP_Block;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\Exceptions\MissingArgumentException;

class GutenbergBlock extends BaseIntegration {
	public readonly string                    $id;
	public readonly string                    $name;
	public readonly string                    $api_version;
	public readonly string                    $title;
	public readonly string|null               $category;
	public readonly array|null                $parent;
	public readonly array|null                $ancestor;
	public readonly array|null                $allowed_blocks;
	public readonly string|null               $icon;
	public readonly string                    $description;
	public readonly array                     $keywords;
	public readonly string|null               $textdomain;
	public readonly array                     $styles;
	public readonly array                     $variations;
	public readonly array                     $selectors;
	public readonly array|null                $supports;
	public readonly array|null                $example;
	public readonly Closure|array|string|null $render_callback;
	public readonly Closure|array|string|null $variation_callback;
	public readonly array|null                $attributes;
	public readonly array                     $uses_context;
	public readonly array|null                $provides_context;
	public readonly array                     $block_hooks;
	public readonly array                     $editor_script_handles;
	public readonly array                     $script_handles;
	public readonly array                     $view_script_handles;
	public readonly array                     $editor_style_handles;
	public readonly array                     $style_handles;
	public readonly array                     $view_style_handles;
	public readonly array                     $items;
	public readonly array                     $tabs;

	/**
	 * @throws MissingArgumentException
	 */
	public function __construct(
		array $args,
		private readonly CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );

		if ( empty( $args['name'] ) || empty( $args['title'] ) ) {
			throw new MissingArgumentException( 'name and title are required' );
		}

		$this->name                  = $args['name'];
		$this->id                    = $args['id'] ?? sprintf( 'wpifycf_block_%s', sanitize_title( $this->name ) );
		$this->api_version           = $args['api_version'] ?? '3';
		$this->title                 = $args['title'];
		$this->category              = $args['category'] ?? null;
		$this->parent                = $args['parent'] ?? null;
		$this->ancestor              = $args['ancestor'] ?? null;
		$this->allowed_blocks        = $args['allowed_blocks'] ?? null;
		$this->icon                  = $args['icon'] ?? null;
		$this->description           = $args['description'] ?? '';
		$this->keywords              = $args['keywords'] ?? array();
		$this->textdomain            = $args['textdomain'] ?? null;
		$this->styles                = $args['styles'] ?? array();
		$this->variations            = $args['variations'] ?? array();
		$this->selectors             = $args['selectors'] ?? array();
		$this->supports              = $args['supports'] ?? null;
		$this->example               = $args['example'] ?? null;
		$this->render_callback       = $args['render_callback'] ?? null;
		$this->variation_callback    = $args['variation_callback'] ?? null;
		$this->uses_context          = $args['uses_context'] ?? array();
		$this->provides_context      = $args['provides_context'] ?? null;
		$this->block_hooks           = $args['block_hooks'] ?? array();
		$this->editor_script_handles = $args['editor_script_handles'] ?? array();
		$this->script_handles        = $args['script_handles'] ?? array();
		$this->view_script_handles   = $args['view_script_handles'] ?? array();
		$this->editor_style_handles  = $args['editor_style_handles'] ?? array();
		$this->style_handles         = $args['style_handles'] ?? array();
		$this->view_style_handles    = $args['view_style_handles'] ?? array();
		$this->items                 = $args['items'] ?? array();
		$this->attributes            = $this->get_attributes();
		$this->tabs                  = $args['tabs'] ?? array();

		add_action( 'init', array( $this, 'register_block' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue' ) );
	}

	public function register_block() {
		$args = array(
			...$this->get_args(),
			'variation_callback'    => $this->variation_callback,
			'editor_script_handles' => $this->editor_script_handles,
			'script_handles'        => $this->script_handles,
			'view_script_handles'   => $this->view_script_handles,
			'editor_style_handles'  => $this->editor_style_handles,
			'style_handles'         => $this->style_handles,
			'view_style_handles'    => $this->view_style_handles,
		);

		if ( $this->render_callback ) {
			$args['render_callback'] = array( $this, 'render' );
		}

		register_block_type( $this->name, $args );
	}

	public function enqueue(): void {
		parent::enqueue();

		$data = array(
			'name'  => $this->name,
			'items' => $this->normalize_items( $this->items ),
			'args'  => $this->get_args(),
			'tabs'  => $this->tabs,
		);

		wp_add_inline_script(
			'wpifycf',
			'document.dispatchEvent(new CustomEvent("wpifycf_register_block",{detail:' . wp_json_encode( $data ) . '}));',
		);
	}

	public function get_args() {
		$args = array(
			'api_version'      => $this->api_version,
			'title'            => $this->title,
			'category'         => $this->category,
			'parent'           => $this->parent,
			'ancestor'         => $this->ancestor,
			'allowed_blocks'   => $this->allowed_blocks,
			'icon'             => $this->icon,
			'description'      => $this->description,
			'keywords'         => $this->keywords,
			'textdomain'       => $this->textdomain,
			'styles'           => $this->styles,
			'variations'       => $this->variations,
			'selectors'        => $this->selectors,
			'supports'         => $this->supports,
			'example'          => $this->example,
			'attributes'       => $this->attributes,
			'uses_context'     => $this->uses_context,
			'provides_context' => $this->provides_context,
			'block_hooks'      => $this->block_hooks,
		);

		foreach ( $args as $key => $arg ) {
			if ( empty( $arg ) ) {
				unset( $args[ $key ] );
			}
		}

		return $args;
	}

	public function get_attributes() {
		$items      = $this->normalize_items( $this->items );
		$attributes = array();

		foreach ( $items as $item ) {
			$attributes[ $item['id'] ] = array(
				'type'    => $this->custom_fields->get_wp_type( $item ),
				'default' => $this->custom_fields->get_default_value( $item ),
			);
		}

		return $attributes;
	}

	public function render( array $attributes, string $content, WP_Block $block ) {
		if (
			( defined( 'REST_REQUEST' ) && REST_REQUEST && filter_input( INPUT_GET, 'context' ) !== 'edit' )
			|| ( $this->render_callback === null )
		) {
			return $content;
		}

		return call_user_func( $this->render_callback, $attributes, $content, $block );
	}
}
