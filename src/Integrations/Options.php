<?php
/**
 * Class Options.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Integrations;

use Closure;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\exceptions\MissingArgumentException;

/**
 * Options class for managing settings pages in the WordPress admin area.
 */
class Options extends OptionsIntegration {
	const TYPE_NETWORK        = 'network';
	const TYPE_USER_SUBMENU   = 'user_submenu';
	const TYPE_USER           = 'user';
	const TYPE_OPTIONS        = 'options';
	const ALLOWED_TYPES       = array( self::TYPE_OPTIONS, self::TYPE_NETWORK, self::TYPE_USER_SUBMENU, self::TYPE_USER );
	const NETWORK_SAVE_ACTION = 'wpifycf-save-network-options';

	/**
	 * ID of the custom fields options instance.
	 *
	 * @var string
	 */
	public readonly string $id;

	/**
	 * Type of the options page.
	 * Possible values are 'options', 'network', 'user_submenu', 'user'.
	 *
	 * @var string
	 */
	public readonly string $type;

	/**
	 * The slug name for the parent menu (or the file name of a standard WordPress admin page).
	 *
	 * @var string|null
	 */
	public readonly string|null $parent_slug;

	/**
	 * The text to be displayed in the title tags of the page when the menu is selected.
	 *
	 * @var string
	 */
	public readonly string $page_title;

	/**
	 * The text to be used for the menu.
	 *
	 * @var string
	 */
	public readonly string $menu_title;

	/**
	 * The capability required for this menu to be displayed to the user.
	 *
	 * @var string
	 */
	public readonly string $capability;

	/**
	 * The slug name to refer to this menu by. Should be unique for this menu and only include lowercase alphanumeric,
	 * dashes, and underscores characters to be compatible with sanitize_key() .
	 *
	 * @var string
	 */
	public readonly string $menu_slug;

	/**
	 * The function to be called to output the content for this page.
	 *
	 * @var Closure|array|string|null
	 */
	public readonly Closure|array|string|null $callback;

	/**
	 * The URL to the icon to be used for this menu.
	 *
	 * Pass a base64-encoded SVG using a data URI, which will be colored to match the color scheme. This should begin with 'data:image/svg+xml;base64,'.
	 * Pass the name of a Dashicons helper class to use a font icon, e.g. 'dashicons-chart-pie'.
	 * Pass 'none' to leave div.wp-menu-image empty so an icon can be added via CSS.
	 *
	 * @var string|null
	 */
	public readonly string|null $icon_url;

	/**
	 * The position in the menu order this item should appear.
	 *
	 * @var int|float|null
	 */
	public readonly int|float|null $position;

	/**
	 * Page’s hook_suffix.
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
	 * Constructor.
	 *
	 * Initializes an Options object, validates required arguments, and sets up action hooks.
	 *
	 * @param array        $args Arguments for the options page.
	 * @param CustomFields $custom_fields The custom fields object.
	 *
	 * @throws MissingArgumentException If required arguments are missing or invalid.
	 */
	public function __construct(
		array $args,
		private readonly CustomFields $custom_fields,
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

		if ( ! empty( $args['type'] ) && ! in_array( $args['type'], $this::ALLOWED_TYPES, true ) ) {
			throw new MissingArgumentException(
				sprintf(
				/* translators: %1$s is the invalid argument type, %2$s is the class name, %3$s is a list of allowed types. */
					esc_html( __( 'Invalid argument type %1$s in class %2$s. Only %3$s allowed.', 'wpify-custom-fields' ) ),
					esc_html( $args['type'] ),
					__CLASS__,
					esc_html( implode( ', ', $this::ALLOWED_TYPES ) ),
				),
			);
		}

		$this->type            = $args['type'] ?? $this::TYPE_OPTIONS;
		$this->page_title      = $args['page_title'];
		$this->menu_title      = $args['menu_title'];
		$this->capability      = $args['capability'] ?? 'manage_options';
		$this->menu_slug       = $args['menu_slug'];
		$this->parent_slug     = $args['parent_slug'] ?? null;
		$this->callback        = $args['callback'] ?? null;
		$this->icon_url        = $args['icon_url'] ?? null;
		$this->position        = $args['position'] ?? null;
		$this->hook_priority   = $args['hook_priority'] ?? 10;
		$this->help_tabs       = $args['help_tabs'] ?? array();
		$this->help_sidebar    = $args['help_sidebar'] ?? '';
		$this->display         = $args['display'] ?? null;
		$this->submit_button   = $args['submit_button'] ?? true;
		$this->items           = $args['items'] ?? array();
		$this->option_name     = $args['option_name'] ?? '';
		$this->option_group    = empty( $this->option_name )
			? sanitize_title( join( '_', array_filter( array( $this->parent_slug, $this->menu_slug ) ) ) )
			: $this->option_name;
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
					'options',
					$this->type,
					$this->menu_slug,
					$this->parent_slug,
					$this->position,
				),
			),
		);

		foreach ( $this->sections as $section ) {
			$this->default_section = $section['id'];
			break;
		}

		add_action( 'admin_init', array( $this, 'register_settings' ) );

		if ( $this->type === $this::TYPE_USER ) {
			add_action( 'user_admin_menu', array( $this, 'register' ), $this->hook_priority );
		} elseif ( $this->type === $this::TYPE_NETWORK ) {
			add_action( 'network_admin_menu', array( $this, 'register' ), $this->hook_priority );
			add_action( 'network_admin_edit_' . $this::NETWORK_SAVE_ACTION, array( $this, 'save_network_options' ) );
			add_action( 'network_admin_notices', array( $this, 'show_network_admin_notices' ) );
		} else {
			add_action( 'admin_menu', array( $this, 'register' ), $this->hook_priority );
		}
	}

	/**
	 * Registers the admin menu page or submenu page.
	 *
	 * This method will conditionally add the menu or submenu page based on the defined properties.
	 * It also sets the action to render help content when the page is loaded.
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

		if ( $this->type === $this::TYPE_USER_SUBMENU ) {
			$hook_suffix = add_users_page(
				$this->page_title,
				$this->menu_title,
				$this->capability,
				$this->menu_slug,
				array( $this, 'render' ),
				$this->position,
			);
		} elseif ( $this->parent_slug ) {
			$hook_suffix = add_submenu_page(
				$this->parent_slug,
				$this->page_title,
				$this->menu_title,
				$this->capability,
				$this->menu_slug,
				array( $this, 'render' ),
				$this->position,
			);
		} else {
			$hook_suffix = add_menu_page(
				$this->page_title,
				$this->menu_title,
				$this->capability,
				$this->menu_slug,
				array( $this, 'render' ),
				$this->icon_url,
				$this->position,
			);
		}

		if ( $this->type === $this::TYPE_NETWORK ) {
			$hook_suffix = $hook_suffix . '-network';
		}

		$this->hook_suffix = $hook_suffix;

		add_action( 'load-' . $this->hook_suffix, array( $this, 'render_help' ) );
	}

	/**
	 * Renders the settings page for the WordPress admin with appropriate form and settings sections.
	 *
	 * @return void
	 */
	public function render(): void {
		if ( ! current_user_can( $this->capability ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! empty( $_GET['settings-updated'] ) ) {
			add_settings_error( $this->menu_slug . '_error', $this->menu_slug . '_message', $this->success_message, 'updated' );
		}

		settings_errors( $this->menu_slug . '_error' );
		$this->enqueue();
		?>
		<div class="wrap">
			<h1>
				<?php echo wp_kses_post( get_admin_page_title() ); ?>
			</h1>
			<?php
			if ( is_callable( $this->callback ) ) {
				call_user_func( $this->callback );
			}

			$action = admin_url( 'options.php' );

			if ( $this->type === $this::TYPE_NETWORK ) {
				$action = add_query_arg( 'action', $this::NETWORK_SAVE_ACTION, 'edit.php' );
			}
			?>
			<form action="<?php echo esc_attr( $action ); ?>" method="POST">
				<?php
				if ( $this->type === $this::TYPE_NETWORK ) {
					wp_nonce_field( $this::NETWORK_SAVE_ACTION );
				}

				$this->print_app( 'options', $this->tabs );

				if ( $this->type !== $this::TYPE_NETWORK ) {
					settings_fields( $this->option_group );
				}

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
	 * Renders the help tabs and sidebar in the WordPress admin interface.
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
	 * Saves network options by sanitizing and setting the appropriate fields.
	 *
	 * Ensures data integrity and security by performing necessary checks and sanitizations on the input fields. Redirects the user upon completion.
	 *
	 * @return void
	 */
	public function save_network_options(): void {
		check_admin_referer( $this::NETWORK_SAVE_ACTION );
		$items = $this->normalize_items( $this->items );

		if ( ! empty( $this->option_name ) ) {
			if ( isset( $_POST[ $this->option_name ] ) ) {
				// Sanitization is done via custom sanitizer.
				// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
				$post_data = $this->custom_fields->sanitize_option_value( $items )( wp_unslash( $_POST[ $this->option_name ] ) );
				$this->set_fields( $this->option_name, $post_data, $items );
			}
		} else {
			foreach ( $items as $item ) {
				if ( ! isset( $_POST[ $item['id'] ] ) ) {
					continue;
				}

				$this->set_field(
					$item['id'],
					$this->get_sanitized_post_item_value( $item ),
					$item,
				);
			}
		}

		wp_safe_redirect(
			add_query_arg(
				array( 'updated' => true ),
				wp_get_referer(),
			),
		);
		exit;
	}

	/**
	 * Registers settings, sections, and fields for the WordPress options page.
	 *
	 * This method normalizes the items and registers each setting with the appropriate
	 * validation and sanitization callbacks. It also adds settings sections and fields
	 * to the options page menu.
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
	 * Normalizes an item by ensuring it has a 'section' identifier.
	 *
	 * If the 'section' key is missing from the item, it will default to 'general'.
	 * Additionally, the method utilizes a parent class method for primary normalization.
	 *
	 * @param array  $item The item to be normalized.
	 * @param string $global_id An optional global identifier.
	 *
	 * @return array The normalized item with an ensured 'section' key.
	 */
	protected function normalize_item( array $item, string $global_id = '' ): array {
		$item = parent::normalize_item( $item, $global_id );

		if ( empty( $item['section'] ) ) {
			$item['section'] = 'general';
		}

		return $item;
	}

	/**
	 * Displays network admin notices on successful updates.
	 *
	 * Checks if the required URL parameters are set and match the expected menu slug, then displays a success message if conditions are met.
	 *
	 * @return void
	 */
	public function show_network_admin_notices(): void {
		// Just showing the success message, no need to check for the nonce.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( isset( $_GET['updated'] ) && isset( $_GET['page'] ) && $this->menu_slug === $_GET['page'] ) {
			?>
			<div id="message" class="updated notice is-dismissible">
				<p><?php echo esc_html( $this->success_message ); ?></p>
			</div>
			<?php
		}
	}

	/**
	 * Retrieves an option value based on the context of the object. If the type is network, it fetches a network option; otherwise, it fetches a regular option.
	 *
	 * @param string $name The name of the option to retrieve.
	 * @param mixed  $default_value The default value to return if the option does not exist.
	 *
	 * @return mixed The value of the option or the default value if the option does not exist.
	 */
	public function get_option_value( string $name, mixed $default_value ): mixed {
		if ( $this->type === $this::TYPE_NETWORK ) {
			return get_network_option( get_current_network_id(), $name, $default_value );
		} else {
			return get_option( $name );
		}
	}

	/**
	 * Sets the value of an option, handling network-specific options if necessary.
	 *
	 * This function updates the value of an option, either at the network level
	 * or at the regular single instance level, depending on the context of the type.
	 *
	 * @param string $name The name of the option to be updated.
	 * @param mixed  $value The new value to set for the specified option.
	 *
	 * @return bool True if the option was successfully updated, false otherwise.
	 */
	public function set_option_value( string $name, mixed $value ): bool {
		if ( $this->type === $this::TYPE_NETWORK ) {
			return update_network_option( get_current_network_id(), $name, $value );
		} else {
			return update_option( $name, $value );
		}
	}
}
