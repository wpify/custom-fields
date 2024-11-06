<?php
/**
 * Class Taxonomy.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Integrations;

use WP_Error;
use WP_Term;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\Exceptions\MissingArgumentException;

/**
 * A class that manages WordPress taxonomy integration with custom fields and items.
 */
class Taxonomy extends ItemsIntegration {
	/**
	 * ID of the custom fields options instance.
	 *
	 * @var string
	 */
	public readonly string $id;

	/**
	 * Taxonomy where to add the custom fields.
	 *
	 * @var string
	 */
	public readonly string $taxonomy;

	/**
	 * Tabs used for the custom fields.
	 *
	 * @var array
	 */
	public readonly array $tabs;

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
	 * Hook priority.
	 *
	 * @var int
	 */
	public readonly int $hook_priority;

	/**
	 * Initialization priority.
	 *
	 * @var int
	 */
	public readonly int $init_priority;

	/**
	 * Currently edited Term ID.
	 *
	 * @var int
	 */
	public readonly int $term_id;

	/**
	 * Constructor for initializing the class with arguments and custom fields.
	 *
	 * @param array        $args Array of arguments including taxonomy, items, id, hook_priority, init_priority, tabs, and meta_key.
	 * @param CustomFields $custom_fields Instance of the CustomFields class used for field management.
	 *
	 * @return void
	 * @throws MissingArgumentException If the required taxonomy argument is missing.
	 */
	public function __construct(
		array $args,
		CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );

		$this->taxonomy = $args['taxonomy'] ?? '';
		$this->items    = $args['items'] ?? array();

		if ( empty( $this->taxonomy ) ) {
			throw new MissingArgumentException(
				sprintf(
				/* translators: %1$s is a list of missing arguments, %2$s is the class name. */
					esc_html( __( 'Missing arguments %1$s in class %2$s.', 'wpify-custom-fields' ) ),
					esc_html( implode( ', ', array( 'taxonomy' ) ) ),
					__CLASS__,
				),
			);
		}

		$this->id            = $args['id'] ?? sanitize_title( $this->taxonomy ) . '_' . wp_generate_uuid4();
		$this->hook_priority = $args['hook_priority'] ?? 10;
		$this->init_priority = $args['init_priority'] ?? 10;
		$this->tabs          = $args['tabs'] ?? array();
		$this->option_name   = $args['meta_key'] ?? '';

		add_action( $this->taxonomy . '_add_form_fields', array( $this, 'render_add_form' ), $this->hook_priority );
		add_action( $this->taxonomy . '_edit_form_fields', array( $this, 'render_edit_form' ), $this->hook_priority );
		add_action( 'created_' . $this->taxonomy, array( $this, 'save' ) );
		add_action( 'edited_' . $this->taxonomy, array( $this, 'save' ) );
		add_action( 'init', array( $this, 'register_meta' ), $this->init_priority );
	}

	/**
	 * Renders the form for adding a new term.
	 *
	 * @return void
	 */
	public function render_add_form(): void {
		$this->term_id = 0;
		$this->enqueue();
		$this->print_app( 'add_term', $this->tabs );

		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			$this->print_field( $item, array(), 'div', 'form-field' );
		}
	}

	/**
	 * Renders the edit form for a given term.
	 *
	 * @param WP_Term $term The term object for which the edit form is being rendered.
	 *
	 * @return void
	 */
	public function render_edit_form( WP_Term $term ): void {
		$this->term_id = $term->term_id;
		$this->enqueue();
		?>
		<tr class="form-field">
			<td colspan="2">
				<?php $this->print_app( 'edit_term', $this->tabs ); ?>
			</td>
		</tr>
		<?php

		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			$this->print_field( $item, array(), 'tr' );
		}
	}

	/**
	 * Registers custom metadata for the specified taxonomy using the provided items.
	 *
	 * This method normalizes the items and registers each one as term meta for the given taxonomy.
	 * It sets various properties such as type, description, default value, and sanitize callback.
	 *
	 * @return void
	 */
	public function register_meta(): void {
		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			register_term_meta(
				$this->taxonomy,
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

	/**
	 * Save method for handling term data and updating custom fields.
	 *
	 * @param int $term_id The ID of the term being saved.
	 *
	 * @return void
	 */
	public function save( int $term_id ): void {
		$this->term_id = $term_id;

		$this->set_fields_from_post_request( $this->normalize_items( $this->items ) );
	}

	/**
	 * Retrieves the value of a specified option, if available.
	 *
	 * @param string $name The name of the option to retrieve.
	 * @param mixed  $default_value The default value to return if the option is not found.
	 *
	 * @return mixed The value of the specified option, or the default value if the option is not found.
	 */
	public function get_option_value( string $name, mixed $default_value ): mixed {
		if ( $this->get_item_id() ) {
			return get_term_meta( $this->get_item_id(), $name, true ) ?? $default_value;
		} else {
			return $default_value;
		}
	}

	/**
	 * Sets the value of a specified option.
	 *
	 * @param string $name The name of the option to set.
	 * @param mixed  $value The value to set for the specified option.
	 *
	 * @return WP_Error|bool|int The result of attempting to update the option value. It returns true on success, false on failure, or an error object on error.
	 */
	public function set_option_value( string $name, mixed $value ): WP_Error|bool|int {
		return update_term_meta( $this->get_item_id(), $name, $value );
	}

	/**
	 * Retrieves the item ID.
	 *
	 * @return int The ID of the item.
	 */
	public function get_item_id(): int {
		return $this->term_id;
	}
}
