<?php

namespace Wpify\CustomFields\Implementations;

use WP_Screen;
use Wpify\CustomFields\CustomFields;

/**
 * Class Options
 * @package CustomFields\Implementations
 */
final class SiteOptions extends AbstractImplementation {
	/** @var string */
	private $page_title;

	/** @var string */
	private $menu_title;

	/** @var string */
	private $capability;

	/** @var string */
	private $menu_slug;

	/** @var int */
	private $position;

	/** @var string */
	private $hook_suffix;

	/** @var array */
	private $items;

	/** @var callable */
	private $display;

	private $blog_id;

	/**
	 * Options constructor.
	 *
	 * @param  array  $args
	 * @param  CustomFields  $wcf
	 */
	public function __construct( array $args, CustomFields $wcf ) {
		parent::__construct( $args, $wcf );

		$args = wp_parse_args( $args, array(
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


		$this->page_title = $args['page_title'];
		$this->menu_title = $args['menu_title'];
		$this->capability = empty( $args['capability'] ) ? 'manage_options' : $args['capability'];
		$this->menu_slug  = $args['menu_slug'];
		$this->position   = $args['position'];
		$this->items      = $args['items'];

		if ( is_callable( $args['display'] ) ) {
			$this->display = $args['display'];
		} else {
			$this->display = function () use ( $args ) {
				return $args['display'];
			};
		}

		add_filter( 'network_edit_site_nav_links', [ $this, 'create_tab' ] );
		add_action( 'network_admin_menu', [ $this, 'register_settings_page' ] );
		add_action( 'admin_init', array( $this, 'register_settings' ), $args['init_priority'] );
		add_action( 'network_admin_edit_wcf-save-site-options', [ $this, 'save_site_options' ] );
		$this->blog_id = empty( $_REQUEST['id'] ) ? 0 : absint( $_REQUEST['id'] );
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
		if ( 'network' === $this->type ) {
			$this->hook_suffix = $this->hook_suffix . '-network';
		}
	}

	/**
	 * Create tab.
	 * @return void
	 */
	public function create_tab( $tabs ) {
		$tabs[ $this->menu_slug ] = array(
			'label' => $this->menu_title,
			'url'   => add_query_arg( 'page', $this->menu_slug, 'sites.php' ),
			'cap'   => 'manage_sites',
		);

		return $tabs;
	}

	/**
	 * Register settings page.
	 * @return void
	 */
	public function register_settings_page() {
		$this->hook_suffix = add_submenu_page( null, $this->menu_title, $this->menu_title, $this->capability, $this->menu_slug, [ $this, 'render' ] );
		$this->hook_suffix = $this->hook_suffix . '-network';
	}

	/**
	 * @return void
	 */
	public function set_wcf_shown( WP_Screen $current_screen ) {
		$this->wcf_shown = $this->hook_suffix === $current_screen->base;
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
	}

	public function get_items() {
		$items = apply_filters( 'wcf_options_items', $this->items, array(
			'page_title' => $this->page_title,
			'menu_title' => $this->menu_title,
			'capability' => $this->capability,
			'menu_slug'  => $this->menu_slug,
			'position'   => $this->position,
		) );

		return $this->prepare_items( $items );
	}

	/**
	 * @return array
	 */
	public function get_data() {
		return array(
			'object_type' => 'options_page',
			'page_title'  => $this->page_title,
			'menu_title'  => $this->menu_title,
			'capability'  => $this->capability,
			'menu_slug'   => $this->menu_slug,
			'position'    => $this->position,
			'hook_suffix' => $this->hook_suffix,
			'items'       => $this->get_items(),
		);
	}

	/**
	 * @param  string  $name
	 *
	 * @return false|mixed|void
	 */
	public function get_field( $name, $item ) {
		return get_blog_option( $this->blog_id, $name );
	}

	/**
	 * @return void
	 */
	public function render() {
		if ( ! current_user_can( $this->capability ) ) {
			return;
		}
		$id = absint( $_REQUEST[ 'id' ] );
		$site = get_site( $id );
		$action = add_query_arg( 'action', 'wcf-save-site-options', 'edit.php' );
		?>
		<div class="wrap">
			<h1 id="edit-site">Edit Site: <?php echo $site->blogname ?></h1>
			<p class="edit-site-actions">
				<a href="<?php echo esc_url( get_home_url( $id, '/' ) ) ?>">Visit</a> | <a href="<?php echo esc_url( get_admin_url( $id ) ) ?>">Dashboard</a>
			</p>
			<?php
			// navigation tabs
			network_edit_site_nav(
				array(
					'blog_id'  => $id,
					'selected' => $this->menu_slug
				)
			);
			?>
			<h2><?php
				echo $this->page_title; ?></h2>
			<?php
			// phpcs:ignore ?>
			<form method="post" name="form" action="<?php echo $action; ?>">
				<input type="hidden" name="id" value="<?php echo $id ?>" />
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
	 * @param  string  $name
	 * @param  string  $value
	 *
	 * @return bool
	 */
	public function set_field( $name, $value, $item ) {
		return update_blog_option( $this->blog_id, $name, $value );
	}

	/**
	 * @return void
	 */
	public function render_section() {
		$this->render_fields();
	}

	/**
	 * Save network options
	 * @return void
	 */
	public function save_site_options() {
		foreach ( $this->get_items() as $item ) {
			if ( ! empty( $_POST[ $item['id'] ] ) ) {
				$this->set_field( $item['id'], json_decode( wp_unslash( $_POST[ $item['id'] ] ), ARRAY_A ), $item );
			}
		}
		wp_safe_redirect( wp_get_referer() );
		exit();
	}
}
