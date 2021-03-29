<?php

namespace WpifyCustomFields\Implementations;

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

	public function __construct( $args ) {
		$args = wp_parse_args( $args, array(
			'type'        => 'normal',
			'parent_slug' => null,
			'page_title'  => '',
			'menu_title'  => '',
			'capability'  => 'manage_options',
			'menu_slug'   => null,
			'section'     => null,
			'page'        => null,
			'icon_url'    => null,
			'position'    => null,
			'items'       => array(),
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
		$this->items       = $this->prepare_items( $args['items'] );

		$this->setup();
	}

	/**
	 * @return void
	 */
	public function setup() {
		if ( $this->type === 'user' ) {
			add_action( 'user_admin_menu', array( $this, 'register' ) );
		} elseif ( $this->type === 'network' ) {
			add_action( 'network_admin_menu', array( $this, 'register' ) );
		} else {
			add_action( 'admin_menu', array( $this, 'register' ) );
		}

		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}

	public function register() {
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

	public function register_settings() {
		add_settings_section(
			'general',
			null,
			array( $this, 'render_section' ),
			$this->menu_slug
		);

		foreach ( $this->items as $item ) {
			register_setting(
				$this->menu_slug,
				$item['name']
			);
		}
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
			'items'       => $this->items,
		);
	}

	public function get_field( $name ) {
		return get_option( $name );
	}

	public function render() {
		if ( ! current_user_can( $this->capability ) ) {
			return;
		}

		if ( isset( $_GET['settings-updated'] ) ) {
			add_settings_error(
				$this->menu_slug . '_messages',
				$this->menu_slug . '_message',
				__( 'Settings saved', 'wpify-custom-fields' ),
				'updated'
			);
		}

		settings_errors( $this->menu_slug . '_messages' );
		?>
		<div class="wrap">
			<h1><?php echo $this->page_title; ?></h1>
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

	public function set_field( $option, $value ) {
		// TODO: Sanitize
		return update_option( $option, $value );
	}

	public function render_section() {
		$this->render_fields();
	}
}
