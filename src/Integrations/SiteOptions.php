<?php
/**
 * Class SiteOptions.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Integrations;

use Closure;
use WP_Screen;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\Exceptions\MissingArgumentException;

/**
 * Handles site-specific options within a WordPress multisite network.
 *
 * This class extends the OptionsIntegration and provides functionalities to
 * register, render, save, and manage site options within a network admin dashboard.
 *
 * @throws MissingArgumentException If required arguments are missing.
 */
class SiteOptions extends OptionsIntegration {
	const SAVE_ACTION = 'wpifycf-save-site-options';

	/**
	 * Blog ID.
	 *
	 * @var int
	 */
	public readonly int $blog_id;

	/**
	 * ID of the custom fields options instance.
	 *
	 * @var string
	 */
	public readonly string $id;

	/**
	 * Page title of the site options.
	 *
	 * @var string
	 */
	public readonly string $page_title;

	/**
	 * Menu title of the site options.
	 *
	 * @var string
	 */
	public readonly string $menu_title;

	/**
	 * Capability for the site options.
	 *
	 * @var string
	 */
	public readonly string $capability;

	/**
	 * Menu slug for site options.
	 *
	 * @var string
	 */
	public readonly string $menu_slug;

	/**
	 * Callback that renders a content on the settings page.
	 *
	 * @var Closure|array|string|null
	 */
	public readonly Closure|array|string|null $callback;

	/**
	 * Generated hook suffix of the page.
	 *
	 * @var string
	 */
	public readonly string $hook_suffix;

	/**
	 * Hook priority.
	 *
	 * @var int
	 */
	public readonly int $hook_priority;

	/**
	 * Help tabs displayed on the screen.
	 *
	 * @var array
	 */
	public readonly array $help_tabs;

	/**
	 * Text for the help sidebar to be added to the settings page.
	 *
	 * @var string
	 */
	public readonly string $help_sidebar;

	/**
	 * Callback that returns boolean that defines if custom fields should be shown.
	 *
	 * @var Closure|array|string|null
	 */
	public Closure|array|string|null $display;

	/**
	 * Submit button definition.
	 *
	 * @var string|array|bool
	 */
	public string|array|bool $submit_button;

	/**
	 * Option group for the settings screen.
	 *
	 * @var string
	 */
	public readonly string $option_group;

	/**
	 * Option Name used to store the custom fields values.
	 *
	 * @var string
	 */
	public readonly string $option_name;

	/**
	 * List of the fields to be shown.
	 *
	 * @var array
	 */
	public readonly array $items;

	/**
	 * List of the sections to be defined.
	 *
	 * @var array
	 */
	public readonly array $sections;

	/**
	 * Default section name.
	 *
	 * @var string
	 */
	public readonly string $default_section;

	/**
	 * Tabs used for the custom fields.
	 *
	 * @var array
	 */
	public readonly array $tabs;

	/**
	 * Success message to be shown.
	 *
	 * @var string
	 */
	public readonly string $success_message;

	/**
	 * Constructor for initializing the class with required parameters.
	 *
	 * @param array        $args Contains page_title, menu_title, menu_slug, and other optional settings.
	 * @param CustomFields $custom_fields An instance of CustomFields.
	 *
	 * @return void
	 * @throws MissingArgumentException If required arguments are missing.
	 */
	public function __construct(
		array $args,
		CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );

		$required = array( 'page_title', 'menu_title', 'menu_slug' );
		$missing  = array();

		foreach ( $required as $arg ) {
			if ( empty( $args[ $arg ] ) ) {
				$missing[] = $arg;
			}
		}

		if ( count( $missing ) > 0 ) {
			throw new MissingArgumentException(
				sprintf(
				/* translators: %1$s is a list of missing arguments, %2$s is the class name. */
					esc_html( __( 'Missing arguments %1$s in class %2$s.', 'wpify-custom-fields' ) ),
					esc_html( implode( ', ', $missing ) ),
					__CLASS__,
				),
			);
		}

		// Nonce verification not needed.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$this->blog_id         = empty( $_REQUEST['id'] ) ? 0 : absint( $_REQUEST['id'] );
		$this->page_title      = $args['page_title'];
		$this->menu_title      = $args['menu_title'];
		$this->capability      = $args['capability'] ?? 'manage_options';
		$this->menu_slug       = $args['menu_slug'];
		$this->callback        = $args['callback'] ?? null;
		$this->hook_priority   = $args['hook_priority'] ?? 10;
		$this->help_tabs       = $args['help_tabs'] ?? array();
		$this->help_sidebar    = $args['help_sidebar'] ?? '';
		$this->display         = $args['display'] ?? null;
		$this->submit_button   = $args['submit_button'] ?? true;
		$this->items           = $args['items'] ?? array();
		$this->option_name     = $args['option_name'] ?? '';
		$this->option_group    = empty( $this->option_name ) ? sanitize_title( $this->menu_slug ) : $this->option_name;
		$this->tabs            = $args['tabs'] ?? array();
		$this->success_message = empty( $args['success_message'] )
			? __( 'Settings saved', 'wpify-custom-fields' )
			: $args['success_message'];

		if ( empty( $args['sections'] ) ) {
			$args['sections'] = array();
		}

		$sections = array();

		foreach ( $args['sections'] as $key => $section ) {
			if ( empty( $section['id'] ) && is_string( $key ) ) {
				$section['id'] = $key;
			}

			$sections[ $section['id'] ] = $section;
		}

		if ( empty( $sections ) ) {
			$sections = array(
				'default' => array(
					'id'       => 'default',
					'title'    => '',
					'callback' => '__return_true',
					'page'     => $this->menu_slug,
				),
			);
		}

		$this->sections = $sections;

		$this->id = sanitize_title(
			join(
				'-',
				array(
					'site-options',
					$this->blog_id,
					$this->menu_slug,
				),
			),
		);

		foreach ( $this->sections as $section ) {
			$this->default_section = $section['id'];
			break;
		}

		add_filter( 'network_edit_site_nav_links', array( $this, 'create_tab' ) );
		add_action( 'network_admin_menu', array( $this, 'register' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ), $this->hook_priority );
		add_action( 'network_admin_edit_' . $this::SAVE_ACTION, array( $this, 'save_site_options' ) );
		add_action( 'current_screen', array( $this, 'set_page_title' ) );
	}

	/**
	 * Registers the submenu page and its related actions if the display condition is met.
	 *
	 * @return void
	 */
	public function register(): void {
		if (
			( $this->display && is_callable( $this->display ) && ! call_user_func( $this->display ) )
			|| ( ! is_null( $this->display ) && ! $this->display )
		) {
			return;
		}

		$hook_suffix = add_submenu_page(
			'',
			$this->page_title,
			$this->menu_title,
			$this->capability,
			$this->menu_slug,
			array( $this, 'render' ),
		);

		$this->hook_suffix = $hook_suffix . '-network';

		add_action( 'load-' . $this->hook_suffix, array( $this, 'render_help' ) );
	}

	/**
	 * Adds a new tab to the given tabs array.
	 *
	 * @param array $tabs The array of existing tabs.
	 *
	 * @return array The updated array of tabs including the newly added tab.
	 */
	public function create_tab( array $tabs ): array {
		$tabs[ $this->menu_slug ] = array(
			'label' => $this->menu_title,
			'url'   => add_query_arg( 'page', $this->menu_slug, 'sites.php' ),
			'cap'   => 'manage_sites',
		);

		return $tabs;
	}

	/**
	 * Renders the settings page for editing a site.
	 *
	 * This method checks user capabilities, retrieves the site details based on the provided ID,
	 * and renders the settings page along with necessary actions and messages.
	 *
	 * @return void
	 */
	public function render(): void {
		if ( ! current_user_can( $this->capability ) ) {
			return;
		}

		// Nonce verification not needed.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$id   = isset( $_REQUEST['id'] ) ? absint( $_REQUEST['id'] ) : 0;
		$site = get_site( $id );

		if ( empty( $site ) ) {
			return;
		}
		$action = add_query_arg( 'action', $this::SAVE_ACTION, 'edit.php' );

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! empty( $_GET['settings-updated'] ) ) {
			add_settings_error( $this->menu_slug . '_error', $this->menu_slug . '_message', $this->success_message, 'updated' );
		}

		settings_errors( $this->menu_slug . '_error' );
		$this->enqueue();
		?>
		<div class="wrap">
			<h1 id="edit-site">
				<?php
				/* translators: %s: Site title. */
				echo esc_html( sprintf( __( 'Edit Site: %s', 'wpify-custom-fields' ), $site->blogname ) );
				?>
			</h1>
			<p class="edit-site-actions">
				<a href="<?php echo esc_url( get_home_url( $id, '/' ) ); ?>"><?php echo esc_html( __( 'Visit', 'wpify-custom-fields' ) ); ?></a>
				|
				<a href="<?php echo esc_url( get_admin_url( $id ) ); ?>"><?php echo esc_html( __( 'Dashboard', 'wpify-custom-fields' ) ); ?></a>
			</p>
			<?php
			network_edit_site_nav(
				array(
					'blog_id'  => $id,
					'selected' => $this->menu_slug,
				),
			);
			?>
			<h2>
				<?php echo wp_kses_post( $this->page_title ); ?>
			</h2>
			<?php
			if ( is_callable( $this->callback ) ) {
				call_user_func( $this->callback );
			}
			?>
			<form action="<?php echo esc_attr( $action ); ?>" method="POST" name="form" data-context="site-options">
				<input type="hidden" name="id" value="<?php echo esc_attr( $id ); ?>" />
				<?php
				// Just showing the success message, no need to check for the nonce.
				// phpcs:ignore WordPress.Security.NonceVerification.Recommended
				if ( isset( $_GET['updated'] ) && isset( $_GET['page'] ) && $this->menu_slug === $_GET['page'] ) {
					?>
					<div id="message" class="updated notice is-dismissible">
						<p><?php echo esc_html( $this->success_message ); ?></p>
					</div>
					<?php
				}

				$this->print_app( 'site-options', $this->tabs );
				settings_fields( $this->option_group );
				do_settings_sections( $this->menu_slug );

				if ( false !== $this->submit_button ) {
					if ( is_array( $this->submit_button ) ) {
						submit_button(
							$this->submit_button['text'] ?? null,
							$this->submit_button['type'] ?? null,
							$this->submit_button['name'] ?? null,
							$this->submit_button['wrap'] ?? true,
							$this->submit_button['other_attributes'] ?? array(),
						);
					} elseif ( is_string( $this->submit_button ) ) {
						submit_button( $this->submit_button );
					} else {
						submit_button();
					}
				}
				?>
			</form>
		</div>
		<?php
	}

	/**
	 * Renders help tabs and sidebar for the current screen.
	 *
	 * This method iterates through the list of help tabs, assigning IDs and titles,
	 * parsing the content, and adding them to the current screen. If a help sidebar
	 * is defined, it sets that as well.
	 *
	 * @return void
	 */
	public function render_help(): void {
		foreach ( $this->help_tabs as $key => $tab ) {
			$tab = wp_parse_args(
				$tab,
				array(
					'id'      => '',
					'title'   => '',
					'content' => '',
				),
			);

			if ( empty( $tab['id'] ) ) {
				if ( ! empty( $key ) && is_string( $key ) ) {
					$tab['id'] = $key;
				} else {
					$tab['id'] = sanitize_title( $tab['title'] ) . '_' . $key;
				}
			}

			if ( is_callable( $tab['content'] ) ) {
				$tab['content'] = call_user_func( $tab['content'] );
			}

			get_current_screen()->add_help_tab( $tab );
		}

		if ( ! empty( $this->help_sidebar ) ) {
			get_current_screen()->set_help_sidebar( $this->help_sidebar );
		}
	}

	/**
	 * Saves the site options.
	 *
	 * This method normalizes the items, processes the incoming POST data for either
	 * a named option or individual items, sanitizes the data, and sets the fields accordingly.
	 * It then redirects the user back to the referring page with a success flag.
	 *
	 * @return void
	 */
	public function save_site_options(): void {
		$this->set_fields_from_post_request( $this->normalize_items( $this->items ) );
		wp_safe_redirect(
			add_query_arg(
				array( 'updated' => true ),
				wp_get_referer(),
			),
		);
		exit;
	}

	/**
	 * Registers the settings for the custom fields.
	 *
	 * This method normalizes the items, registers individual or grouped settings based on the given configuration,
	 * and adds the necessary sections and fields to the settings page.
	 *
	 * @return void
	 */
	public function register_settings(): void {
		$items = $this->normalize_items( $this->items );

		if ( empty( $this->option_name ) ) {
			foreach ( $items as $item ) {
				register_setting(
					$this->option_group,
					$item['id'],
					array(
						'type'              => $this->custom_fields->get_wp_type( $item ),
						'label'             => $item['label'] ?? '',
						'sanitize_callback' => $this->custom_fields->sanitize_item_value( $item ),
						'show_in_rest'      => false,
						'default'           => $this->custom_fields->get_default_value( $item ),
					),
				);
			}
		} else {
			register_setting(
				$this->option_group,
				$this->option_name,
				array(
					'type'              => 'object',
					'label'             => $this->page_title,
					'sanitize_callback' => $this->custom_fields->sanitize_option_value( $items ),
					'show_in_rest'      => false,
					'default'           => array(),
				),
			);
		}

		foreach ( $this->sections as $id => $section ) {
			add_settings_section(
				$id,
				$section['label'] ?? '',
				$section['callback'] ?? '__return_true',
				$this->menu_slug,
				$section['args'] ?? array(),
			);
		}

		foreach ( $items as $item ) {
			$section = $this->sections[ $item['section'] ]['id'] ?? $this->default_section;

			add_settings_field(
				$item['id'],
				$item['label'],
				array( $this, 'print_field' ),
				$this->menu_slug,
				$section,
				array(
					'label_for' => $item['id'],
					...$item,
				),
			);
		}
	}

	/**
	 * Normalizes an item by setting default values for its properties.
	 *
	 * This method overrides the parent function to provide additional normalization for the item.
	 * If the 'section' property is not set, it defaults to 'general'.
	 *
	 * @param array  $item The item to be normalized.
	 * @param string $global_id Optional. A global identifier that can be used during normalization. Default is an empty string.
	 *
	 * @return array The normalized item.
	 */
	protected function normalize_item( array $item, string $global_id = '' ): array {
		$item = parent::normalize_item( $item, $global_id );

		if ( empty( $item['section'] ) ) {
			$item['section'] = 'general';
		}

		return $item;
	}

	/**
	 * Sets the page title for a network admin screen when editing a specific site.
	 *
	 * This method updates the global `$title` variable with a formatted string representing the current site's name.
	 *
	 * @param WP_Screen $current_screen The current screen object.
	 *
	 * @return void
	 */
	public function set_page_title( WP_Screen $current_screen ): void {
		if ( is_network_admin() && $current_screen->id === $this->hook_suffix ) {
			global $title;
			$site = get_site( $this->blog_id );

			/* translators: Blog name */
			$title = sprintf( __( 'Edit Site: %s', 'wpify-custom-fields' ), esc_html( $site->blogname ) ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		}
	}

	/**
	 * Retrieves the value of a specified option for the current blog.
	 *
	 * @param string $name The name of the option to retrieve.
	 * @param mixed  $default_value The default value to return if the option does not exist.
	 */
	public function get_option_value( string $name, mixed $default_value ): mixed {
		return get_blog_option( $this->blog_id, $name, $default_value );
	}

	/**
	 * Sets the value of a specified option for the current blog.
	 *
	 * @param string $name The name of the option to set.
	 * @param mixed  $value The value to set for the specified option.
	 *
	 * @return bool True if the option was successfully set, false otherwise.
	 */
	public function set_option_value( string $name, mixed $value ): bool {
		return update_blog_option( $this->blog_id, $name, $value );
	}
}
