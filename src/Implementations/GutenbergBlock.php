<?php

namespace Wpify\CustomFields\Implementations;

use Wpify\CustomFields\CustomFields;
use WP_Screen;

final class GutenbergBlock extends AbstractImplementation {
	private $name;
	private $title;
	private $category;
	private $parent;
	private $icon;
	private $description;
	private $keywords;
	private $textdomain;
	private $styles;
	private $supports;
	private $example;
	private $render_callback;
	private $attributes;
	private $uses_context;
	private $provides_context;
	private $editor_script;
	private $script;
	private $editor_style;
	private $style;
	private $items;

	/** @var callable */
	private $display;

	/**
	 * GutenbergBlock constructor.
	 *
	 * @param array        $args
	 * @param CustomFields $wcf
	 */
	public function __construct( array $args, CustomFields $wcf ) {
		$defaults = array(
			'name'             => null, // string
			'title'            => '', // string
			'category'         => 'common', // string
			'parent'           => null, // string
			'icon'             => null, // string
			'description'      => null, // string
			'keywords'         => array(), // array
			'textdomain'       => 'wpify-custom-fields', // string
			'styles'           => array(), // array
			'supports'         => null, // array
			'example'          => null, // array
			'render_callback'  => array( $this, 'render_default' ), // callable
			'uses_context'     => array(), // array
			'provides_context' => null, // array
			'editor_script'    => null, // string
			'script'           => null, // string
			'editor_style'     => null, // string
			'style'            => null, // string
			'items'            => array(), // array
			'init_priority'    => 10,
			'display'          => function () {
				return true;
			},
		);

		$args = wp_parse_args( $args, $defaults );

		if ( empty( $args['title'] ) ) {
			$args['title'] = $args['name'];
		}

		if ( empty( $args['icon'] ) ) {
			$args['icon'] = file_get_contents( __DIR__ . '/../../images/wpify-logo-bw.svg' );
		}

		parent::__construct( $args, $wcf );

		foreach ( $defaults as $key => $value ) {
			if ( ! in_array( $key, array( 'init_priority' ) ) ) {
				$this->{$key} = $args[ $key ];
			}
		}

		if ( is_callable( $args['display'] ) ) {
			$this->display = $args['display'];
		} else {
			$this->display = function () use ( $args ) {
				return $args['display'];
			};
		}

		add_action( 'init', array( $this, 'register_block' ), $defaults['init_priority'] );
		add_action( 'current_screen', array( $this, 'add_editor_script' ) );
	}

	/**
	 * @return void
	 */
	public function register_block() {
		$display_callback = $this->display;

		if ( ! boolval( $display_callback() ) ) {
			return;
		}

		$args = $this->get_args();

		register_block_type( $this->name, $args );
	}

	/**
	 * @return void
	 */
	public function add_editor_script( $current_screen ) {
		$display_callback = $this->display;

		if ( ! boolval( $display_callback() ) ) {
			return;
		}

		$args = $this->get_args();

		if ( $current_screen->is_block_editor() || in_array( $current_screen->id, array( 'widgets', 'customize' ) ) ) {
			$js_args          = $this->get_args( array( 'render_callback' ) );
			$js_args['items'] = $this->fill_selects( $js_args['items'] );
			$script           = 'window.wcf_blocks=(window.wcf_blocks||{});window.wcf_blocks[\'' . $this->name . '\']=' . wp_json_encode( $js_args, JSON_UNESCAPED_UNICODE ) . ';';
			$script           .= 'window.wcf_build_url=' . wp_json_encode( $this->get_build_url() ) . ';';

			wp_add_inline_script( $args['editor_script'], $script, 'before' );
		}
	}

	/**
	 * @return array
	 */
	public function get_args( $exclude = array() ) {
		$args   = array();
		$fields = array(
			'name',
			'title',
			'category',
			'parent',
			'icon',
			'description',
			'keywords',
			'textdomain',
			'styles',
			'supports',
			'example',
			'render_callback',
			'uses_context',
			'provides_context',
			'editor_script',
			'script',
			'editor_style',
			'style',
			'attributes',
			'items',
		);

		foreach ( $fields as $field ) {
			if ( in_array( $field, $exclude ) ) {
				continue;
			}

			$method = 'get_' . $field;

			if ( method_exists( $this, $method ) ) {
				$args[ $field ] = $this->$method();
			} elseif ( property_exists( $this, $field ) ) {
				$args[ $field ] = $this->{$field};
			}
		}

		$args['api'] = array(
			'url'   => $this->api->get_rest_url(),
			'nonce' => $this->api->get_rest_nonce(),
			'path'  => $this->api->get_rest_path(),
		);

		return $args;
	}

	/**
	 * @return string|null
	 */
	public function get_editor_script() {
		if ( empty( $this->editor_script ) ) {
			if ( is_admin() ) {
				wp_enqueue_editor();
				wp_enqueue_code_editor( array( 'type' => 'text/html' ) );
			}

			return $this->wcf->get_assets()->register_script(
				'wpify-custom-blocks.js',
				array( 'wp-tinymce', 'code-editor' ),
				true,
				array(
					'wcf_code_editor_settings' => $this->wcf->get_assets()->get_code_editor_settings(),
					'wcf_build_url'            => $this->get_build_url(),
					'wcf_date'                 => array(
						'date_format' => get_option( 'date_format' ),
						'time_format' => get_option( 'time_format' )
					),
				)
			);
		}

		return null;
	}

	/**
	 * @return string|null
	 */
	public function get_editor_style() {
		if ( empty( $this->editor_style ) ) {
			return $this->wcf->get_assets()->register_style( 'wpify-custom-blocks.css' );
		}

		return null;
	}

	/**
	 * @return array
	 */
	public function get_attributes() {
		$attributes = array();
		$items      = array_values( array_filter( $this->get_items() ) );

		foreach ( $items as $item ) {
			$attributes[ $item['id'] ] = array(
				'type'    => $this->get_item_type( $item ),
				'default' => $item['default'] ?? null,
			);
		}

		return $attributes;
	}

	/**
	 * @return array
	 */
	public function get_items() {
		$items = apply_filters( 'wcf_gutenberg_block_items', $this->items, array_merge(
			array( 'name' => $this->name ),
			$this->get_args( array( 'attributes', 'items' ) )
		) );

		return $this->prepare_items( $items );
	}

	/**
	 * @param string $name
	 *
	 * @return mixed
	 */
	public function get_field( $name, $item ) {
		// TODO: Implement get_field() method.
	}

	/**
	 * @param string $name
	 * @param string $value
	 *
	 * @return mixed
	 */
	public function set_field( $name, $value, $item ) {
		// TODO: Implement set_field() method.
	}

	/**
	 * @return array
	 */
	public function get_data() {
		return array(
			'name'             => $this->name,
			'title'            => $this->title,
			'category'         => $this->category,
			'parent'           => $this->parent,
			'icon'             => $this->icon,
			'description'      => $this->description,
			'keywords'         => $this->keywords,
			'textdomain'       => $this->textdomain,
			'styles'           => $this->styles,
			'supports'         => $this->supports,
			'example'          => $this->example,
			'uses_context'     => $this->uses_context,
			'provides_context' => $this->provides_context,
			'editor_script'    => $this->editor_script,
			'script'           => $this->script,
			'editor_style'     => $this->editor_style,
			'style'            => $this->style,
			'items'            => $this->get_items(),
		);
	}

	/**
	 * @param WP_Screen $current_screen
	 *
	 * @return bool
	 */
	public function set_wcf_shown( WP_Screen $current_screen ) {
		return $current_screen->parent_base === 'edit';
	}

	public function render_default( $attributes ) {
		$render = '<h2>' . $this->title . ' (<code>' . $this->name . '</code>)</h2>';

		foreach ( $this->get_items() as $item ) {
			$value  = empty( $attributes[ $item['id'] ] ) ? null : $attributes[ $item['id'] ];
			$render .= $this->render_default_item( $item, $value );
		}

		return $render;
	}

	public function render_default_item( $item, $value ) {
		ob_start();
		?>
		<div style="border-left:1px solid black;padding-left:10px;margin:10px 0;font-size:12px;">
			<strong><?php echo esc_html( $item['title'] ); ?> (<code><?php echo esc_html( $item['id'] ); ?></code>)</strong>
			<br>
			<?php if ( isset( $item['items'] ) ): ?>
				<?php
				if ( is_array( $value ) ) {
					foreach ( $value as $index => $inner_value ) {
						if ( $index > 0 ) {
							echo '<hr>';
						}

						foreach ( $item['items'] as $inner_item ) {
							echo $this->render_default_item( $inner_item, empty( $inner_value[ $inner_item['id'] ] ) ? null : $inner_value[ $inner_item['id'] ] );
						}
					}
				}
				?>
			<?php else: ?>
				<?php echo print_r( $value, true ); ?>
			<?php endif; ?>
		</div>
		<?php
		return ob_get_clean();
	}
}
