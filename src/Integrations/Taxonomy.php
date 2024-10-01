<?php

namespace Wpify\CustomFields\Integrations;

use WP_Term;
use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\Exceptions\MissingArgumentException;

class Taxonomy extends Integration {
	public readonly string $id;
	public readonly string $taxonomy;
	public readonly array  $tabs;
	public readonly array  $items;
	public readonly int    $hook_priority;
	public readonly int    $init_priority;
	public readonly int    $term_id;

	/**
	 * @throws MissingArgumentException
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

		add_action( $this->taxonomy . '_add_form_fields', array( $this, 'render_add_form' ), $this->hook_priority );
		add_action( $this->taxonomy . '_edit_form_fields', array( $this, 'render_edit_form' ), $this->hook_priority );
		add_action( 'created_' . $this->taxonomy, array( $this, 'save' ) );
		add_action( 'edited_' . $this->taxonomy, array( $this, 'save' ) );
		add_action( 'init', array( $this, 'register_meta' ), $this->init_priority );
	}

	public function render_add_form() {
		$this->term_id = 0;
		$this->enqueue();
		$this->print_app( 'add_term', $this->tabs );

		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			$this->print_field( $item, array(), 'div', 'form-field' );
		}
	}

	public function render_edit_form( WP_Term $term ) {
		$this->term_id = $term->term_id;
		$this->enqueue();
		?>
		<tr class="form-field">
			<td colspan="2">
				<?php $this->print_app( 'edit_term', $this->tabs ) ?>
			</td>
		</tr>
		<?php

		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			$this->print_field( $item, array(), 'tr' );
		}
	}

	public function get_field( string $name, $item = array() ) {
		if ( ! empty( $item['callback_get'] ) ) {
			return call_user_func( $item['callback_get'], $item, $this->term_id );
		} elseif ( $this->term_id ) {
			return get_term_meta( $this->term_id, $name, true );
		} elseif ( $item['default'] ) {
			return $item['default'];
		} else {
			return '';
		}
	}

	public function set_field( string $name, $value, $item = array() ) {
		if ( ! empty( $item['callback_set'] ) ) {
			return call_user_func( $item['callback_set'], $item, $this->term_id, $value );
		} else {
			return update_term_meta( $this->term_id, $name, wp_slash( $value ) );
		}
	}

	public function register_meta() {
		$items = $this->normalize_items( $this->items );

		foreach ( $items as $item ) {
			$wp_type          = apply_filters( 'wpifycf_field_type_' . $item['type'], 'string', $item );
			$wp_default_value = apply_filters( 'wpifycf_field_' . $wp_type . '_default_value', '', $item );
			$sanitizer        = fn( $value ) => apply_filters( 'wpifycf_sanitize_field_type_' . $item['type'], $value, $item );

			register_term_meta(
				$this->taxonomy,
				$item['id'],
				array(
					'type'              => $wp_type,
					'description'       => $item['label'],
					'single'            => true,
					'default'           => $item['default'] ?? $wp_default_value,
					'sanitize_callback' => $sanitizer,
					'show_in_rest'      => false,
				),
			);
		}
	}

	public function save( $term_id ) {
		$this->term_id = $term_id;
		$items         = $this->normalize_items( $this->items );

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
}
