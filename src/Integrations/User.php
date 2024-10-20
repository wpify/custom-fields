<?php

namespace Wpify\CustomFields\Integrations;

use Closure;
use Wpify\CustomFields\CustomFields;

class User extends ItemsIntegration {
	public int|null                           $user_id;
	public readonly string                    $option_name;
	public readonly array                     $items;
	public readonly array|string|Closure|null $display;
	public readonly string                    $title;
	public readonly array                     $tabs;
	public readonly string                    $id;
	public readonly int                       $init_priority;

	public function __construct(
		array $args,
		private CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );

		$this->items         = $args['items'] ?? array();
		$this->user_id       = $args['user_id'] ?? null;
		$this->title         = $args['title'] ?? '';
		$this->init_priority = $args['init_priority'] ?? 10;
		$this->tabs          = $args['tabs'] ?? array();
		$this->option_name   = $args['meta_key'] ?? '';

		if ( isset( $args['display'] ) && is_callable( $args['display'] ) ) {
			$this->display = $args['display'];
		} else {
			$this->display = function () use ( $args ) {
				return $args['display'] ?? true;
			};
		}

		$this->id = $args['id'] ?? 'user__' . sanitize_title( $this->title ) . '__' . wp_generate_uuid4();

		add_action( 'show_user_profile', array( $this, 'render_edit_form' ) );
		add_action( 'edit_user_profile', array( $this, 'render_edit_form' ) );
		add_action( 'personal_options_update', array( $this, 'save' ) );
		add_action( 'edit_user_profile_update', array( $this, 'save' ) );
		add_action( 'init', array( $this, 'register_meta' ), $this->init_priority );
	}

	public function register_meta() {
		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			register_meta(
				'user',
				$item['id'],
				array(
					'type'              => $this->custom_fields->get_wp_type( $item ),
					'description'       => $item['label'],
					'single'            => true,
					'default'           => $this->custom_fields->get_default_value( $item ),
					'sanitize_callback' => $this->custom_fields->sanitize_item_value( $item ),
				),
			);
		}
	}

	public function render_edit_form( $user ) {
		$display_callback = $this->display;

		if ( ! $display_callback() ) {
			return;
		}

		$this->user_id = $user->ID;
		$items         = $this->normalize_items( $this->items );

		$this->enqueue();

		if ( ! empty( $this->title ) ) {
			?>
			<h3><?php echo esc_html( $this->title ); ?></h3>
			<?php
		}
		$this->print_app( 'user', $this->tabs );
		?>
		<table class="form-table" role="presentation">
			<tbody>
			<?php
			foreach ( $items as $item ) {
				?>
				<tr>
					<th scope="row">
						<label for="<?php echo esc_attr( $item['id'] ); ?>">
							<?php echo esc_html( $item['label'] ); ?>
						</label>
					</th>
					<td>
						<?php $this->print_field( $item ); ?>
					</td>
				</tr>
				<?php
			}
			?>
			</tbody>
		</table>
		<?php
	}

	public function save( $user_id ) {
		$this->user_id = $user_id;
		$items         = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			// Nonce verification is already done by WordPress.
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

	public function get_option_value( string $name, mixed $default_value ) {
		return get_user_meta( $this->get_item_id(), $name, true ) ?? $default_value;
	}

	public function set_option_value( string $name, mixed $value ) {
		return update_user_meta( $this->get_item_id(), $name, $value );
	}

	function get_item_id(): int {
		return $this->user_id;
	}
}
