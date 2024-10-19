<?php

namespace Wpify\CustomFields\Integrations;

use WC_Product;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\Exceptions\MissingArgumentException;

class WcMembershipPlanOptions extends Integration {
	public readonly string $id;
	public int $membership_plan_id;
	public readonly array $tab;
	public readonly string $capability;
	public readonly array|string|null $callback;
	public readonly array $args;
	public readonly string $hook_suffix;
	public readonly int $hook_priority;
	public readonly array $help_tabs;
	public readonly string $help_sidebar;
	public $display;
	public readonly string $option_name;
	public readonly array $items;
	public readonly array $sections;
	public readonly array $tabs;
	public bool $is_new_tab;

	public function __construct(
		array $args,
		private CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );

		$required = array( 'tab', 'items' );
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

		if ( isset( $args['display'] ) && is_callable( $args['display'] ) ) {
			$this->display = $args['display'];
		} else {
			$this->display = function () use ( $args ) {
				return $args['display'] ?? true;
			};
		}

		$this->capability    = $args['capability'] ?? 'manage_options';
		$this->callback      = $args['callback'] ?? null;
		$this->hook_priority = $args['hook_priority'] ?? 10;
		$this->help_tabs     = $args['help_tabs'] ?? array();
		$this->help_sidebar  = $args['help_sidebar'] ?? '';
		$this->items         = $args['items'] ?? array();
		$this->option_name   = $args['option_name'] ?? '';
		$this->tabs          = $args['tabs'] ?? array();
		$this->is_new_tab    = false;

		$tab = $args['tab'] ?? array();

		if ( empty( $tab['label'] ) ) {
			throw new MissingArgumentException(
				sprintf(
				/* translators: %1$s is the class name. */
					esc_html( __( 'Missing argument $tab["label"] in class %1$s.', 'wpify-custom-fields' ) ),
					__CLASS__,
				),
			);
		}

		if ( empty( $tab['id'] ) ) {
			$tab['id'] = sanitize_title( $tab['label'] );
		}

		if ( empty( $tab['target'] ) ) {
			$tab['target'] = $tab['id'];
		}

		if ( empty( $tab['priority'] ) ) {
			$tab['priority'] = 100;
		}

		if ( empty( $tab['class'] ) ) {
			$tab['class'] = array();
		}

		$this->tab = $tab;
		$this->id  = sanitize_title(
			join(
				'-',
				array(
					'wc_membership_plan_options',
					$this->tab['id'],
					sanitize_title( $this->tab['label'] ),
					$this->hook_priority,
				),
			),
		);

		add_filter( 'wc_membership_plan_data_tabs', array( $this, 'wc_membership_plan_data_tabs' ), 98 );
		add_action( 'wc_membership_plan_data_panels', array( $this, 'render_data_panels' ) );
		add_action(
			'wc_membership_plan_options_' . $this->tab['target'] ?? $this->tab['id'],
			array(
				$this,
				'render',
			),
		);

		add_action( 'wc_memberships_save_meta_box', array( $this, 'save' ) );
		add_action( 'init', array( $this, 'register_meta' ), $this->hook_priority );
	}

	public function wc_membership_plan_data_tabs( array $tabs ): array {
		if ( isset( $tabs[ $this->tab['id'] ] ) ) {
			if ( ! empty( $this->tab['label'] ) ) {
				$tabs[ $this->tab['id'] ]['label'] = $this->tab['label'];
			}

			if ( ! empty( $this->tab['priority'] ) ) {
				$tabs[ $this->tab['id'] ]['priority'] = $this->tab['priority'];
			}
		} else {
			$this->is_new_tab = true;

			$tabs[ $this->tab['id'] ] = array(
				'label'    => $this->tab['label'],
				'priority' => $this->tab['priority'],
				'target'   => $this->tab['target'],
				'class'    => $this->tab['class'],
			);
		}

		return $tabs;
	}


	public function render_data_panels(): void {
		?>
		<div id="<?php echo esc_attr( $this->tab['target'] ); ?>" class="panel woocommerce_options_panel">
			<?php do_action( 'wc_membership_plan_options_' . $this->tab['target'] ); ?>
		</div>
		<?php
	}

	public function render(): void {
		if ( ! current_user_can( $this->capability ) ) {
			return;
		}

		global $post;

		$this->membership_plan_id = $post->ID;
		$this->enqueue();
		$items = $this->normalize_items( $this->items );

		if ( is_callable( $this->callback ) ) {
			call_user_func( $this->callback );
		}
		?>
		<div class="options_group">
			<?php
			$this->print_app( 'product-options', $this->tabs );

			foreach ( $items as $item ) {
				?>
				<div class="form-field">
					<?php $this->print_field( $item ); ?>
				</div>
				<?php
			}
			?>
		</div>
		<?php
	}

	public function get_field( $name, $item = array() ): mixed {
		if ( isset( $item['callback_get'] ) && is_callable( $item['callback_get'] ) ) {
			return call_user_func( $item['callback_get'], $item );
		}

		return get_post_meta( $this->membership_plan_id, $name, true );
	}

	public function set_field( $name, $value, $item = array() ) {
		if ( isset( $item['callback_set'] ) && is_callable( $item['callback_set'] ) ) {
			return call_user_func( $item['callback_set'], $item, $value );
		}

		return update_post_meta( $this->membership_plan_id, $name, wp_slash( $value ) );
	}

	public function get_product(): bool|WC_Product|null {
		return wc_get_product( $this->membership_plan_id );
	}

	public function save( $post_id ): void {
		$items = $this->normalize_items( $this->items );

		// Nonce already verified by WordPress.
		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		$this->membership_plan_id = sanitize_text_field( wp_unslash( $_POST['post_ID'] ?? '' ) );

		if ( ! $this->membership_plan_id ) {
			return;
		}

		foreach ( $items as $item ) {
			// Nonce already verified by WordPress.
			// phpcs:ignore WordPress.Security.NonceVerification.Missing
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

	public function register_meta(): void {
		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			register_post_meta(
				'product',
				$item['id'],
				array(
					'type'              => $this->custom_fields->get_wp_type( $item ),
					'description'       => $item['label'],
					'single'            => true,
					'default'           => $this->custom_fields->get_default_value( $item ),
					'sanitize_callback' => $this->custom_fields->sanitize_item_value( $item ),
					'show_in_rest'      => false,
				),
			);
		}
	}
}
