<?php

namespace Wpify\CustomFields\Implementations;

use WP_Screen;
use Wpify\CustomFields\CustomFields;

/**
 * Class Options
 * @package CustomFields\Implementations
 */
final class Options extends AbstractImplementation {
	/** @var string */
	private $type;

	/** @var string */
	private $page_title;

	/** @var string */
	private $menu_title;

	/** @var string */
	private $capability;

	/** @var string */
	private $parent_slug;

	/** @var string */
	private $menu_slug;

	/** @var string */
	private $page;

	/** @var string */
	private $section;

	/** @var string */
	private $icon_url;

	/** @var int */
	private $position;

	/** @var string */
	private $hook_suffix;

	/** @var array */
	private $items;

	/** @var callable */
	private $display;

	/**
	 * Options constructor.
	 *
	 * @param array        $args
	 * @param CustomFields $wcf
	 */
	public function __construct( array $args, CustomFields $wcf ) {
		parent::__construct( $args, $wcf );

		$args = wp_parse_args( $args, array(
				'type'          => 'normal',
				'parent_slug'   => null,
				'page_title'    => '',
				'menu_title'    => '',
				'capability'    => 'manage_options',
				'menu_slug'     => null,
				'section'       => null,
				'page'          => null,
				'icon_url'      => null,
				'position'      => null,
				'priority'      => 100,
				'init_priority' => 10,
				'items'         => array(),
				'display'       => function () {
					return true;
				},
		) );

		$this->type        = in_array( $args['type'], array( 'normal', 'user', 'network' ) ) ? $args['type'] : 'normal';
		$this->parent_slug = $args['parent_slug'];
		$this->page_title  = $args['page_title'];
		$this->menu_title  = $args['menu_title'];
		$this->capability  = empty( $args['capability'] ) ? 'manage_options' : $args['capability'];
		$this->menu_slug   = $args['menu_slug'];
		$this->section     = $args['section'];
		$this->page        = $args['page'];
		$this->icon_url    = $args['icon_url'];
		$this->position    = $args['position'];
		$this->items       = $args['items'];

		if ( is_callable( $args['display'] ) ) {
			$this->display = $args['display'];
		} else {
			$this->display = function () use ( $args ) {
				return $args['display'];
			};
		}

		if ( $this->type === 'user' ) {
			add_action( 'user_admin_menu', array( $this, 'register' ), $args['priority'] );
		} elseif ( $this->type === 'network' ) {
			add_action( 'network_admin_menu', array( $this, 'register' ), $args['priority'] );
		} else {
			add_action( 'admin_menu', array( $this, 'register' ), $args['priority'] );
		}

		add_action( 'admin_init', array( $this, 'register_settings' ), $args['init_priority'] );
	}

	/**
	 * @return void
	 */
	public function register() {
		$display_callback = $this->display;

		if ( ! boolval( $display_callback() ) ) {
			return;
		}

		if ( empty( $this->parent_slug ) ) {
			$this->hook_suffix = add_menu_page(
					$this->page_title,
					$this->menu_title,
					$this->capability,
					$this->menu_slug,
					array( $this, 'render' ),
					$this->icon_url,
					$this->position
			);
		} elseif ( ! empty( $this->menu_slug ) ) {
			$this->hook_suffix = add_submenu_page(
					$this->parent_slug,
					$this->page_title,
					$this->menu_title,
					$this->capability,
					$this->menu_slug,
					array( $this, 'render' ),
					$this->position
			);
		}
	}

	/**
	 * @return void
	 */
	public function set_wcf_shown( WP_Screen $current_screen ) {
		$this->wcf_shown = ( $this->hook_suffix === $current_screen->base );
	}

	/**
	 * @return void
	 */
	public function register_settings() {
		$display_callback = $this->display;

		if ( ! boolval( $display_callback() ) ) {
			return;
		}

		add_settings_section(
				'general',
				null,
				array( $this, 'render_section' ),
				$this->menu_slug
		);

		foreach ( $this->get_items() as $item ) {
			register_setting(
					$this->menu_slug,
					$item['id'],
					array(
							'type'              => $this->get_item_type( $item ),
							'description'       => $item['title'],
							'default'           => $item['default'] ?? null,
							'sanitize_callback' => $this->sanitizer->get_sanitizer( $item ),
					)
			);
		}
	}

	public function get_items() {
		$items = apply_filters( 'wcf_options_items', $this->items, array(
				'type'        => $this->type,
				'parent_slug' => $this->parent_slug,
				'page_title'  => $this->page_title,
				'menu_title'  => $this->menu_title,
				'capability'  => $this->capability,
				'menu_slug'   => $this->menu_slug,
				'section'     => $this->section,
				'page'        => $this->page,
				'icon_url'    => $this->icon_url,
				'position'    => $this->position,
		) );

		return $this->prepare_items( $items );
	}

	/**
	 * @return array
	 */
	public function get_data() {
		return array(
				'object_type' => 'options_page',
				'type'        => $this->type,
				'page_title'  => $this->page_title,
				'menu_title'  => $this->menu_title,
				'capability'  => $this->capability,
				'parent_slug' => $this->parent_slug,
				'menu_slug'   => $this->menu_slug,
				'icon_url'    => $this->icon_url,
				'position'    => $this->position,
				'hook_suffix' => $this->hook_suffix,
				'items'       => $this->get_items(),
		);
	}

	/**
	 * @param string $name
	 *
	 * @return false|mixed|void
	 */
	public function get_field( $name, $item ) {
		return get_option( $name );
	}

	/**
	 * @return void
	 */
	public function render() {
		if ( ! current_user_can( $this->capability ) ) {
			return;
		}
		?>
		<div class="wrap">
			<h1><?php echo $this->page_title; ?></h1>
			<?php // phpcs:ignore ?>
			<form method="post" name="form" action="options.php">
				<?php
				settings_fields( $this->menu_slug );
				do_settings_sections( $this->menu_slug );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}

	/**
	 * @param string $name
	 * @param string $value
	 *
	 * @return bool
	 */
	public function set_field( $name, $value, $item ) {
		return update_option( $name, $value );
	}

	/**
	 * @return void
	 */
	public function render_section() {
		$this->render_fields();
	}
}
