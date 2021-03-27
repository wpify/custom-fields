<?php

namespace WpifyCustomFields;

final class OptionsPage {
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
		$this->items       = is_array( $args['items'] ) ? $args['items'] : array();

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

	/**
	 * @return string
	 */
	public function get_type() {
		return $this->type;
	}

	/**
	 * @return string
	 */
	public function get_hook_suffix() {
		return $this->hook_suffix;
	}

	public function register() {
		if ( empty( $this->parent_slug ) ) {
			$this->hook_suffix = add_menu_page(
					$this->get_page_title(),
					$this->get_menu_title(),
					$this->get_capability(),
					$this->get_menu_slug(),
					array( $this, 'render' ),
					$this->get_icon_url(),
					$this->get_position()
			);
		} elseif ( ! empty( $this->menu_slug ) ) {
			$this->hook_suffix = add_submenu_page(
					$this->get_parent_slug(),
					$this->get_page_title(),
					$this->get_menu_title(),
					$this->get_capability(),
					$this->get_menu_slug(),
					array( $this, 'render' ),
					$this->get_position()
			);
		}
	}

	/**
	 * @return string
	 */
	public function get_page_title() {
		return $this->page_title;
	}

	/**
	 * @return string
	 */
	public function get_menu_title() {
		return $this->menu_title;
	}

	/**
	 * @return string
	 */
	public function get_capability() {
		return $this->capability;
	}

	/**
	 * @return string
	 */
	public function get_menu_slug() {
		return $this->menu_slug;
	}

	/**
	 * @return string
	 */
	public function get_icon_url() {
		return $this->icon_url;
	}

	/**
	 * @return int
	 */
	public function get_position() {
		return $this->position;
	}

	/**
	 * @return string
	 */
	public function get_parent_slug() {
		return $this->parent_slug;
	}

	public function register_settings() {
		add_settings_section(
				'general',
				null,
				array( $this, 'render_settings' ),
				$this->get_menu_slug()
		);

		foreach ( $this->get_items() as $item ) {
			register_setting(
					$this->get_menu_slug(),
					$item['name']
			);

			add_settings_field(
					$item['name'],
					$item['label'],
					'__return_empty_string',
					$this->get_parent_slug(),
					'general'
			);
		}
	}

	/**
	 * @return array
	 */
	public function get_items() {
		return $this->items;
	}

	public function render_settings() {
		$data = $this->get_data();

		foreach ( $data['items'] as $key => $item ) {
			if ( empty( $data['items'][ $key ]['id'] ) ) {
				$data['items'][ $key ]['id'] = $data['items'][ $key ]['name'];
			}

			$value = $this->get_field( $item['name'] );

			if ( empty( $value ) ) {
				$data['items'][ $key ]['value'] = '';
			} else {
				$data['items'][ $key ]['value'] = $value;
			}
		}

		$json = wp_json_encode( $data );
		?>
		<div class="js-wcf" data-wcf="<?php echo esc_attr( $json ) ?>"></div>
		<?php
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
		if ( ! current_user_can( $this->get_capability() ) ) {
			return;
		}

		if ( isset( $_GET['settings-updated'] ) ) {
			add_settings_error( $this->get_menu_slug() . '_messages', $this->get_menu_slug() . '_message', __( 'Settings saved', 'wpify-custom-fields' ), 'updated' );
		}

		settings_errors( $this->get_menu_slug() . '_messages' );
		?>
		<div class="wrap">
			<h1><?php echo $this->get_page_title(); ?></h1>
			<form method="post" name="form" action="options.php">
				<?php
				settings_fields( $this->get_menu_slug() );
				do_settings_sections( $this->get_menu_slug() );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}

	/** @return string */
	public function get_section(): string {
		return $this->section;
	}

	/** @return string */
	public function get_page(): string {
		return $this->page;
	}

	public function set_field( $option, $value ) {
		return update_option( $option, $value );
	}
}
