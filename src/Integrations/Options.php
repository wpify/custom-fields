<?php

namespace Wpify\CustomFields\Integrations;

use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\exceptions\MissingArgumentException;

class Options extends Integration {
	const TYPE_NETWORK        = 'network';
	const TYPE_USER           = 'user';
	const TYPE_OPTIONS        = 'options';
	const ALLOWED_TYPES       = array( self::TYPE_OPTIONS, self::TYPE_NETWORK, self::TYPE_USER );
	const NETWORK_SAVE_ACTION = 'wcf-save-network-options';

	public readonly string         $id;
	public readonly string         $type;
	public readonly string|null    $parent_slug;
	public readonly string         $page_title;
	public readonly string         $menu_title;
	public readonly string         $capability;
	public readonly string         $menu_slug;
	public readonly array|string   $callback;
	public readonly string|null    $icon_url;
	public readonly int|float|null $position;
	public readonly array          $args;
	public readonly string         $hook_suffix;
	public readonly int            $hook_priority;
	public readonly array          $help_tabs;
	public readonly string         $help_sidebar;
	public array|string|null       $display;
	public string|array|bool       $submit_button;
	public readonly string         $option_group;
	public readonly array          $items;
	public readonly array          $sections;

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

		if ( ! empty( $args['type'] ) && ! in_array( $args['type'], $this::ALLOWED_TYPES ) ) {
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

		$this->type          = $args['type'] ?? $this::TYPE_OPTIONS;
		$this->page_title    = $args['page_title'];
		$this->menu_title    = $args['menu_title'];
		$this->capability    = $args['capability'] ?? 'manage_options';
		$this->menu_slug     = $args['menu_slug'];
		$this->parent_slug   = $args['parent_slug'] ?? null;
		$this->callback      = $args['callback'] ?? null;
		$this->icon_url      = $args['icon_url'] ?? null;
		$this->position      = $args['position'] ?? null;
		$this->hook_priority = $args['hook_priority'] ?? 10;
		$this->help_tabs     = $args['help_tabs'] ?? array();
		$this->help_sidebar  = $args['help_sidebar'] ?? '';
		$this->display       = $args['display'] ?? null;
		$this->submit_button = $args['submit_button'] ?? true;
		$this->option_group  = sanitize_title( join( '_', array_filter( array( $this->parent_slug, $this->menu_slug ) ) ) );
		$this->items         = $args['items'] ?? array();
		$this->sections      = $args['sections'] ?? array(
			array(
				'id'       => 'default',
				'title'    => '',
				'callback' => '__return_true',
				'page'     => $this->menu_slug,
			),
		);

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

		add_action( 'admin_init', array( $this, 'register_settings' ) );

		if ( $this->type === $this::TYPE_USER ) {
			add_action( 'user_admin_menu', array( $this, 'register' ), $this->hook_priority );
		} elseif ( $this->type === $this::TYPE_NETWORK ) {
			add_action( 'network_admin_menu', array( $this, 'register' ), $this->hook_priority );
			add_action( 'network_admin_edit_' . $this::NETWORK_SAVE_ACTION, array( $this, 'save_network_options' ) );
		} else {
			add_action( 'admin_menu', array( $this, 'register' ), $this->hook_priority );
		}
	}

	public function register(): void {
		if (
			( $this->display && is_callable( $this->display ) && ! call_user_func( $this->display ) )
			|| ( ! is_null( $this->display ) && ! $this->display )
		) {
			return;
		}

		if ( $this->parent_slug ) {
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

	public function render(): void {
		if ( ! current_user_can( $this->capability ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! empty( $_GET['settings-updated'] ) ) {
			add_settings_error( $this->menu_slug . '_error', $this->menu_slug . '_message', __( 'Settings saved', 'wpify-custom-fields' ), 'updated' );
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

			$action = 'options.php';

			if ( $this->type === $this::TYPE_NETWORK ) {
				$action = add_query_arg( 'action', $this::NETWORK_SAVE_ACTION, 'edit.php' );
			}
			?>
			<form action="<?php echo esc_attr( $action ) ?>" method="POST">
				<div class="wpifycf-app" data-loaded="false" data-integration-id="<?php echo esc_attr( $this->id ) ?>" data-context="options"></div>
				<?php
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

	public function save_network_options(): void {
//		foreach ( $this->get_items() as $item ) {
//			if ( ! empty( $_POST[ $item['id'] ] ) ) {
//				$this->set_field( $item['id'], json_decode( wp_unslash( $_POST[ $item['id'] ] ), ARRAY_A ), $item );
//			}
//		}
		wp_safe_redirect( wp_get_referer() );
		exit();
	}

	public function register_settings() {
		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			$type = apply_filters( 'wpifycf_option_field_type_' . $item['type'], 'string', $item );

			register_setting(
				$this->option_group,
				$item['id'],
				array(
					'type'              => $type,
					'label'             => $item['label'] ?? '',
					'description'       => $item['description'] ?? '',
					'sanitize_callback' => function ( $value ) use ( $item ) {
						return apply_filters( 'wpifycf_sanitize_field_type_' . $item['type'], $value, $item );
					},
					'show_in_rest'      => false,
					'default'           => $item['default'],
				),
			);
		}

		foreach ( $this->sections as $key => $section ) {
			if ( empty( $section['id'] ) && is_string( $key ) ) {
				$section['id'] = $key;
			}

			add_settings_section(
				$section['id'] ?? '',
				$section['label'] ?? '',
				$section['callback'] ?? '__return_true',
				$this->menu_slug,
				$section['args'] ?? array(),
			);
		}

		foreach ( $items as $item ) {
			add_settings_field(
				$item['id'],
				$item['label'],
				array( $this, 'print_field' ),
				$this->menu_slug,
				$item['section'],
				array(
					'label_for' => $item['id'],
					...$item,
				),
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

	public function print_field( array $item ): void {
		$value = get_option( $item['id'], $item['default'] );
		$value = is_string( $value ) ? html_entity_decode( $value ) : $value;
		$props = array( ...$item, 'value' => $value );
		$json  = wp_json_encode( $props );
		?>
		<div class="wpifycf-field wpifycf-field--options wpifycf-field--type-<?php echo esc_attr( $item['id'] ) ?>" data-props="<?php echo esc_attr( $json ) ?>" data-integration-id="<?php echo esc_attr( $this->id ) ?>"></div>
		<?php
	}
}
