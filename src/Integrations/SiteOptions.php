<?php

namespace Wpify\CustomFields\Integrations;

use WP_Screen;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\Exceptions\MissingArgumentException;

class SiteOptions extends Integration {
	const SAVE_ACTION = 'wpifycf-save-site-options';

	public readonly int               $blog_id;
	public readonly string            $id;
	public readonly string            $page_title;
	public readonly string            $menu_title;
	public readonly string            $capability;
	public readonly string            $menu_slug;
	public readonly array|string|null $callback;
	public readonly string            $hook_suffix;
	public readonly int               $hook_priority;
	public readonly array             $help_tabs;
	public readonly string            $help_sidebar;
	public array|string|null          $display;
	public string|array|bool          $submit_button;
	public readonly string            $option_group;
	public readonly string            $option_name;
	public readonly array             $items;
	public readonly array             $sections;
	public readonly string            $default_section;
	public readonly array             $tabs;
	public readonly string            $success_message;

	/**
	 * @throws MissingArgumentException
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
				'default' => array( 'id' => 'default', 'title' => '', 'callback' => '__return_true', 'page' => $this->menu_slug ),
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

	public function create_tab( array $tabs ): array {
		$tabs[ $this->menu_slug ] = array(
			'label' => $this->menu_title,
			'url'   => add_query_arg( 'page', $this->menu_slug, 'sites.php' ),
			'cap'   => 'manage_sites',
		);

		return $tabs;
	}

	public function render(): void {
		if ( ! current_user_can( $this->capability ) ) {
			return;
		}

		$id     = absint( $_REQUEST['id'] );
		$site   = get_site( $id );
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
				printf( __( 'Edit Site: %s' ), esc_html( $site->blogname ) );
				?>
			</h1>
			<p class="edit-site-actions">
				<a href="<?php echo esc_url( get_home_url( $id, '/' ) ); ?>"><?php _e( 'Visit' ); ?></a>
				|
				<a href="<?php echo esc_url( get_admin_url( $id ) ); ?>"><?php _e( 'Dashboard' ); ?></a>
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
				<input type="hidden" name="id" value="<?php echo esc_attr( $id ) ?>" />
				<?php
				// Just showing the success message, no need to check for the nonce.
				// phpcs:ignore WordPress.Security.NonceVerification.Recommended
				if ( isset( $_GET['updated'] ) && isset( $_GET['page'] ) && $this->menu_slug === $_GET['page'] ) {
					?>
					<div id="message" class="updated notice is-dismissible">
						<p><?php echo esc_html( $this->success_message ) ?></p>
					</div>
					<?php
				}

				$this->print_app( 'site-options', $this->tabs );
				settings_fields( $this->option_group );
				do_settings_sections( $this->menu_slug );

				if ( $this->submit_button !== false ) {
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

	public function render_help(): void {
		foreach ( $this->help_tabs as $key => $tab ) {
			$tab = wp_parse_args(
				$tab,
				array( 'id' => '', 'title' => '', 'content' => '' ),
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

	public function save_site_options(): void {
		$items = $this->normalize_items( $this->items );

		if ( ! empty( $this->option_name ) ) {
			if ( isset( $_POST[ $this->option_name ] ) ) {
				$data = $this->get_field( $this->option_name );

				// Sanitization is done via a filter to allow for custom sanitization.
				// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
				$post_data = apply_filters( 'wpifycf_sanitize_option', wp_unslash( $_POST[ $this->option_name ] ), $items );

				foreach ( $items as $item ) {
					if ( isset( $post_data[ $item['id'] ] ) ) {
						if ( isset( $item['callback_set'] ) && is_callable( $item['callback_set'] ) ) {
							$data[ $item['id'] ] = call_user_func( $item['callback_set'], $item, $post_data[ $item['id'] ] );
						} else {
							$data[ $item['id'] ] = apply_filters( 'wpifycf_sanitize_field_type_' . $item['type'], $post_data[ $item['id'] ], $item );
						}
					}
				}

				update_blog_option( $this->blog_id, $this->option_name, $data );
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

	public function register_settings(): void {
		$items = $this->normalize_items( $this->items );

		if ( empty( $this->option_name ) ) {
			foreach ( $items as $item ) {
				$wp_type          = apply_filters( 'wpifycf_field_type_' . $item['type'], 'string', $item );
				$wp_default_value = apply_filters( 'wpifycf_field_' . $wp_type . '_default_value', '', $item );
				$sanitizer        = fn( $value ) => apply_filters( 'wpifycf_sanitize_field_type_' . $item['type'], $value, $item );

				register_setting(
					$this->option_group,
					$item['id'],
					array(
						'type'              => $wp_type,
						'label'             => $item['label'] ?? '',
						'sanitize_callback' => $sanitizer,
						'show_in_rest'      => false,
						'default'           => $item['default'] ?? $wp_default_value,
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
					'sanitize_callback' => fn( $value ) => apply_filters( 'wpifycf_sanitize_option', $value, $items ),
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
				array( 'label_for' => $item['id'], ...$item ),
			);
		}
	}

	protected function normalize_item( array $item, string $global_id = '' ): array {
		$item = parent::normalize_item( $item, $global_id );

		if ( empty( $item['section'] ) ) {
			$item['section'] = 'general';
		}

		return $item;
	}

	public function get_field( string $name, $item = array() ): mixed {
		if ( isset( $item['callback_get'] ) && is_callable( $item['callback_get'] ) ) {
			return call_user_func( $item['callback_get'], $item );
		}

		if ( ! empty( $this->option_name ) ) {
			$data = get_blog_option( $this->blog_id, $this->option_name, array() );

			return $data[ $name ] ?? null;
		} else {
			return get_blog_option( $this->blog_id, $name, null );
		}
	}

	public function set_field( string $name, $value, $item = array() ): bool {
		if ( isset( $item['callback_set'] ) && is_callable( $item['callback_set'] ) ) {
			return call_user_func( $item['callback_set'], $item, $value );
		}

		if ( ! empty( $this->option_name ) ) {
			$data          = get_blog_option( $this->blog_id, $this->option_name, array() );
			$data[ $name ] = $value;

			return update_blog_option( $this->blog_id, $this->option_name, $data );
		} else {
			return update_blog_option( $this->blog_id, $name, $value );
		}
	}

	public function set_page_title( WP_Screen $current_screen ): void {
		if ( is_network_admin() && $current_screen->id === $this->hook_suffix ) {
			global $title;
			$site  = get_site( $this->blog_id );
			$title = sprintf( __( 'Edit Site: %s' ), esc_html( $site->blogname ) );
		}
	}
}
