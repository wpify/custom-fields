<?php
/**
 * Test double: a concrete OptionsIntegration backed by real WordPress options.
 *
 * OptionsIntegration is the plugin's canonical save/load engine — every options
 * page and item integration shares its normalize / sanitize / store / read code.
 * This thin concrete subclass lets the tests exercise that engine directly and
 * exposes the protected normalize_items()/prepare_items_for_js() helpers.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Support;

use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\Integrations\OptionsIntegration;

/**
 * Minimal OptionsIntegration used as the field-type-axis harness in tests.
 */
class ProbeOptions extends OptionsIntegration {
	/**
	 * Instance id.
	 *
	 * @var string
	 */
	public readonly string $id;

	/**
	 * Option name (empty = one option row per field).
	 *
	 * @var string
	 */
	public readonly string $option_name;

	/**
	 * Field definitions.
	 *
	 * @var array
	 */
	public readonly array $items;

	/**
	 * Constructor.
	 *
	 * @param array        $args          Accepts 'id', 'option_name', 'items'.
	 * @param CustomFields $custom_fields The plugin instance.
	 */
	public function __construct( array $args, CustomFields $custom_fields ) {
		parent::__construct( $custom_fields );

		$this->id          = $args['id'] ?? 'probe_options';
		$this->option_name = $args['option_name'] ?? '';
		$this->items       = $args['items'] ?? array();
	}

	/**
	 * Reads an option, honouring the supplied default.
	 *
	 * @param string $name          Option name.
	 * @param mixed  $default_value Default when unset.
	 *
	 * @return mixed
	 */
	public function get_option_value( string $name, mixed $default_value ): mixed {
		return get_option( $name, $default_value );
	}

	/**
	 * Writes an option.
	 *
	 * @param string $name  Option name.
	 * @param mixed  $value Value to store.
	 *
	 * @return bool
	 */
	public function set_option_value( string $name, mixed $value ): bool {
		return update_option( $name, $value );
	}

	/**
	 * Public access to the protected normalizer.
	 *
	 * @param array|null $items Items to normalize (defaults to $this->items).
	 *
	 * @return array
	 */
	public function normalize( ?array $items = null ): array {
		return $this->normalize_items( $items ?? $this->items );
	}

	/**
	 * Public access to the protected JS-preparation step.
	 *
	 * @param array $items Normalized items.
	 *
	 * @return array
	 */
	public function prepare( array $items ): array {
		return $this->prepare_items_for_js( $items );
	}
}
