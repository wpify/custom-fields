<?php
/**
 * Class GutenbergBlock.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Integrations;

use Closure;
use stdClass;
use WP_Block;
use WP_REST_Server;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\Exceptions\MissingArgumentException;

/**
 * Class representing a Gutenberg Block within the WordPress environment.
 *
 * This class extends the base integration class and provides additional functionalities
 * to handle Gutenberg blocks, including registration, asset enqueuing, and rendering.
 *
 * @throws MissingArgumentException If the required 'name' or 'title' fields are missing.
 */
class GutenbergBlock extends BaseIntegration {
	/**
	 * ID of the custom fields options instance.
	 *
	 * @var string
	 */
	public readonly string $id;

	/**
	 * Block type name including namespace.
	 *
	 * @var string
	 */
	public readonly string $name;

	/**
	 * Block API version.
	 *
	 * @var string
	 */
	public readonly string $api_version;

	/**
	 * Human-readable block type label.
	 *
	 * @var string
	 */
	public readonly string $title;

	/**
	 * Block type category classification, used in search interfaces to arrange block types by category.
	 *
	 * @var string|null
	 */
	public readonly string|null $category;

	/**
	 * Setting parent lets a block require that it is only available when nested within the specified blocks.
	 *
	 * @var string[]|null
	 */
	public readonly array|null $parent;

	/**
	 * Setting ancestor makes a block available only inside the specified block types at any position of the ancestor’s block subtree.
	 *
	 * @var string[]|null
	 */
	public readonly array|null $ancestor;

	/**
	 * Limits which block types can be inserted as children of this block type.
	 *
	 * @var string[]|null
	 */
	public readonly array|null $allowed_blocks;

	/**
	 * Block type icon.
	 *
	 * @var string|null
	 */
	public readonly string|null $icon;

	/**
	 * A detailed block type description.
	 *
	 * @var string
	 */
	public readonly string $description;

	/**
	 * Additional keywords to produce block type as result in search interfaces.
	 *
	 * @var string[]
	 */
	public readonly array $keywords;

	/**
	 * The translation textdomain.
	 *
	 * @var string|null
	 */
	public readonly string|null $textdomain;

	/**
	 * Alternative block styles.
	 *
	 * @var array[]
	 */
	public readonly array $styles;

	/**
	 * Block variations.
	 *
	 * @var array[]
	 */
	public readonly array $variations;

	/**
	 * Custom CSS selectors for theme.json style generation.
	 *
	 * @var array
	 */
	public readonly array $selectors;

	/**
	 * Supported features.
	 *
	 * @var array|null
	 */
	public readonly array|null $supports;

	/**
	 * Structured data for the block preview.
	 *
	 * @var array|null
	 */
	public readonly array|null $example;

	/**
	 * Block type render callback.
	 *
	 * @var Closure|array|string|null
	 */
	public readonly Closure|array|string|null $render_callback;

	/**
	 * Block type variations callback.
	 *
	 * @var Closure|array|string|null
	 */
	public readonly Closure|array|string|null $variation_callback;

	/**
	 * Block type attributes property schemas.
	 *
	 * @var array|null
	 */
	public readonly array|null $attributes;

	/**
	 * Context values inherited by blocks of this type.
	 *
	 * @var string[]
	 */
	public readonly array $uses_context;

	/**
	 * Context provided by blocks of this type.
	 *
	 * @var string[]|null
	 */
	public readonly array|null $provides_context;

	/**
	 * Block hooks.
	 *
	 * @var string[]
	 */
	public readonly array $block_hooks;

	/**
	 * Block type editor only script handles.
	 *
	 * @var string[]
	 */
	public readonly array $editor_script_handles;

	/**
	 * Block type front end and editor script handles.
	 *
	 * @var string[]
	 */
	public readonly array $script_handles;

	/**
	 * Block type front end only script handles.
	 *
	 * @var string[]
	 */
	public readonly array $view_script_handles;

	/**
	 * Block type editor only style handles.
	 *
	 * @var string[]
	 */
	public readonly array $editor_style_handles;

	/**
	 * Block type front end and editor style handles.
	 *
	 * @var string[]
	 */
	public readonly array $style_handles;

	/**
	 * Block type front end only style handles.
	 *
	 * @var string[]
	 */
	public readonly array $view_style_handles;

	/**
	 * List of the fields to be shown.
	 *
	 * @var array
	 */
	public readonly array $items;

	/**
	 * Tabs used for the custom fields.
	 *
	 * @var array
	 */
	public readonly array $tabs;

	/**
	 * Constructor for the class.
	 *
	 * @param array        $args Configuration arguments for the class.
	 * @param CustomFields $custom_fields Instance of CustomFields.
	 *
	 * @return void
	 * @throws MissingArgumentException Missing argument.
	 */
	public function __construct(
		array $args,
		CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );

		if ( empty( $args['name'] ) || empty( $args['title'] ) ) {
			throw new MissingArgumentException( 'name and title are required' );
		}

		$this->name           = $args['name'];
		$this->id             = $args['id'] ?? sprintf( 'wpifycf_block_%s', sanitize_title( $this->name ) );
		$this->api_version    = $args['api_version'] ?? '3';
		$this->title          = $args['title'];
		$this->category       = $args['category'] ?? null;
		$this->parent         = $args['parent'] ?? null;
		$this->ancestor       = $args['ancestor'] ?? null;
		$this->allowed_blocks = $args['allowed_blocks'] ?? null;

		if ( ! empty( $args['icon'] ) && file_exists( $args['icon'] ) ) {
			global $wp_filesystem;
			if ( empty( $wp_filesystem ) ) {
				require_once ABSPATH . 'wp-admin/includes/file.php';
				WP_Filesystem();
			}
			$this->icon = $wp_filesystem->get_contents( $args['icon'] );
		} elseif ( ! empty( $args['icon'] ) ) {
			$this->icon = $args['icon'];
		} else {
			$this->icon = null;
		}

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
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Registers a custom block with the given arguments and configurations.
	 *
	 * @return void
	 */
	public function register_block(): void {
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

	/**
	 * Enqueue the script and dispatch a custom event with the block data.
	 *
	 * @return void
	 */
	public function enqueue(): void {
		parent::enqueue();

		$data = array(
			'name'     => $this->name,
			'items'    => $this->normalize_items( $this->items ),
			'args'     => $this->get_args(),
			'tabs'     => $this->tabs,
			'instance' => $this->custom_fields->get_script_handle(),
		);

		wp_add_inline_script(
			$this->custom_fields->get_script_handle(),
			'document.dispatchEvent(new CustomEvent("wpifycf_register_block_' . $this->custom_fields->get_script_handle() . '",{detail:' . wp_json_encode( $data ) . '}));',
		);
	}

	/**
	 * Retrieves the arguments for the block configuration.
	 *
	 * This method collects various configuration properties of the block,
	 * filters out any empty values, and returns the resulting array.
	 *
	 * @return array The array of block configuration arguments, with empty values removed.
	 */
	public function get_args(): array {
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

	/**
	 * Retrieves the attributes for the items.
	 *
	 * Normalizes the items and then creates an array of attributes, where each attribute is identified by
	 * its ID and contains its type and default value.
	 *
	 * @return array Associative array of attributes, with each key being an item ID and each value being
	 *               an array containing 'type' and 'default' keys.
	 */
	public function get_attributes(): array {
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

	/**
	 * Renders a block's content based on provided attributes and a rendering callback.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content The block content.
	 * @param WP_Block $block The block instance.
	 *
	 * @return string The rendered block content.
	 */
	public function render( array $attributes, string $content, WP_Block $block ): string {
		if (
			( defined( 'REST_REQUEST' ) && REST_REQUEST && filter_input( INPUT_GET, 'context' ) !== 'edit' )
			|| ( null === $this->render_callback )
		) {
			return $content;
		}

		$attributes = $this->normalize_attributes( $attributes );

		$content = call_user_func( $this->render_callback, $attributes, $content, $block );

		if ( empty( $content ) || ! is_string( $content ) ) {
			return '';
		}

		return $content;
	}

	/**
	 * Registers the REST API routes for the block.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		$this->custom_fields->api->register_rest_route(
			'render-block/' . $this->name,
			WP_REST_Server::CREATABLE,
			array( $this, 'render_from_api' ),
		);
	}

	/**
	 * Renders a block's content based on provided attributes and a rendering callback.
	 *
	 * @param \WP_REST_Request $request The REST API request object.
	 *
	 * @return string The rendered block content.
	 */
	public function render_from_api( \WP_REST_Request $request ): string {
		$attributes = $request->get_param( 'attributes' );
		$post_id    = $request->get_param( 'postId' );

		$parsed_block = array(
			'blockName'    => $this->name,
			'attrs'        => $attributes,
			'innerBlocks'  => array(),
			'innerHTML'    => '',
			'innerContent' => array(),
		);

		if ( null === $this->render_callback ) {
			return '';
		}

		if ( $post_id ) {
			setup_postdata( $post_id );
		}

		$attributes = $this->normalize_attributes( $attributes );

		return call_user_func( $this->render_callback, $attributes, '', new WP_Block( $parsed_block ) );
	}

	/**
	 * Normalizes the attributes array.
	 *
	 * @param array $attributes Block attributes.
	 *
	 * @return array
	 */
	public function normalize_attributes( array $attributes ): array {
		$normalized_attributes = array();

		foreach ( $attributes as $attribute_name => $attribute_value ) {
			if ( $attribute_value instanceof stdClass ) {
				$normalized_attributes[ $attribute_name ] = (array) $attribute_value;
			} else {
				$normalized_attributes[ $attribute_name ] = $attribute_value;
			}
		}

		return $normalized_attributes;
	}
}
