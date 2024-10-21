<?php
/**
 * Class User.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Integrations;

use Closure;
use WP_User;
use Wpify\CustomFields\CustomFields;

/**
 * Class User extends ItemsIntegration to manage custom fields and meta for user profiles in WordPress.
 */
class User extends ItemsIntegration {
	/**
	 * Currently edited User ID.
	 *
	 * @var int|null
	 */
	public int|null $user_id;

	/**
	 * Meta key used to store the custom fields values.
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
	 * Callback that returns boolean that defines if custom fields should be shown.
	 *
	 * @var Closure|array|string|null
	 */
	public readonly Closure|array|string|null $display;

	/**
	 * Title of the custom fields.
	 *
	 * @var string
	 */
	public readonly string $title;

	/**
	 * Tabs used for the custom fields.
	 *
	 * @var array
	 */
	public readonly array $tabs;

	/**
	 * ID of the custom fields options instance.
	 *
	 * @var string
	 */
	public readonly string $id;

	/**
	 * Hook Priority of initialization.
	 *
	 * @var int
	 */
	public readonly int $init_priority;

	/**
	 * Constructor method.
	 *
	 * @param array        $args Configuration arguments, including items, user_id, title, init_priority, tabs, meta_key, display, and id.
	 * @param CustomFields $custom_fields An instance of CustomFields used for custom field operations.
	 *
	 * @return void
	 */
	public function __construct(
		array $args,
		private readonly CustomFields $custom_fields,
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

	/**
	 * Registers meta fields for user profiles.
	 *
	 * Normalizes the items and registers each meta field with specific properties
	 * such as type, description, default value, and sanitize callback.
	 *
	 * @return void
	 */
	public function register_meta(): void {
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

	/**
	 * Renders the edit form for a user.
	 *
	 * @param WP_User $user The user object whose profile is being edited.
	 *
	 * @return void
	 */
	public function render_edit_form( WP_User $user ): void {
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

	/**
	 * Saves the custom field values for a user.
	 *
	 * @param int $user_id The ID of the user whose data is being saved.
	 *
	 * @return void
	 */
	public function save( int $user_id ): void {
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

	/**
	 * Retrieves an option value for a given name. If the option does not exist,
	 * returns the provided default value.
	 *
	 * @param string $name The name of the option to retrieve.
	 * @param mixed  $default_value The value to return if the option is not found.
	 *
	 * @return mixed The value of the option if it exists, otherwise the default value.
	 */
	public function get_option_value( string $name, mixed $default_value ): mixed {
		return get_user_meta( $this->get_item_id(), $name, true ) ?? $default_value;
	}

	/**
	 * Sets a value for the specified option name.
	 *
	 * @param string $name The name of the option to set.
	 * @param mixed  $value The value to set for the option.
	 *
	 * @return bool|int True on success, false on failure.
	 */
	public function set_option_value( string $name, mixed $value ): bool|int {
		return update_user_meta( $this->get_item_id(), $name, $value );
	}

	/**
	 * Retrieves the item ID.
	 *
	 * @return int The ID of the item.
	 */
	public function get_item_id(): int {
		return $this->user_id;
	}
}
