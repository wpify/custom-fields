<?php

namespace WpifyCustomFields;

use WpifyCustomFieldsDeps\Wpify\Core\Abstracts\AbstractComponent;

/** @property Plugin $plugin */
class OptionsPage extends AbstractComponent {
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
	private $icon_url;

	/** @var int */
	private $position;

	/** @var string */
	private $hook_suffix;

	public function __construct( $args ) {

		$args = wp_parse_args( $args, array(
			'type'        => 'normal',
			'parent_slug' => null,
			'page_title'  => '',
			'menu_title'  => '',
			'capability'  => 'manage_options',
			'menu_slug'   => null,
			'icon_url'    => null,
			'position'    => null,
		) );

		$this->type        = in_array( $args['type'], array( 'normal', 'user', 'network' ) ) ? $args['type'] : 'normal';
		$this->parent_slug = $args['parent_slug'];
		$this->page_title  = $args['page_title'];
		$this->menu_title  = $args['menu_title'];
		$this->capability  = empty( $args['capability'] ) ? 'manage_options' : $args['capability'];
		$this->menu_slug   = $args['menu_slug'];
		$this->icon_url    = $args['icon_url'];
		$this->position    = $args['position'];
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
	public function get_parent_slug() {
		return $this->parent_slug;
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
	public function get_hook_suffix() {
		return $this->hook_suffix;
	}

	public function register() {
		if ( empty( $this->parent_slug ) ) {
			$hook_suffix = add_menu_page(
				$this->page_title,
				$this->menu_title,
				$this->capability,
				$this->menu_slug,
				array( $this, 'render' ),
				$this->icon_url,
				$this->position
			);
		} else {
			$hook_suffix = add_submenu_page(
				$this->parent_slug,
				$this->page_title,
				$this->menu_title,
				$this->capability,
				$this->menu_slug,
				array( $this, 'render' ),
				$this->position
			);
		}

		$this->hook_suffix = $hook_suffix;

	}

	public function render() {
		?>
		<div class="wrap">
			<h1><?php echo $this->get_page_title(); ?></h1>
		</div>
		<?php
	}

	/**
	 * @return string
	 */
	public function get_page_title() {
		return $this->page_title;
	}
}
