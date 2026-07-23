<?php
/**
 * Base test case exposing a fresh CustomFields instance.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Support;

use WP_UnitTestCase;
use Wpify\CustomFields\CustomFields;

/**
 * Shared base class for the WPify Custom Fields PHP tests.
 */
abstract class TestCase extends WP_UnitTestCase {
	/**
	 * A CustomFields instance under test.
	 *
	 * @var CustomFields
	 */
	protected CustomFields $cf;

	/**
	 * Sets up a CustomFields instance for each test.
	 */
	public function set_up(): void {
		parent::set_up();
		$this->cf = wpify_custom_fields();
	}

	/**
	 * Builds a minimal field item array for a given type.
	 *
	 * @param string $type  Field type.
	 * @param array  $extra Extra keys to merge (e.g. id, items, default).
	 *
	 * @return array
	 */
	protected function item( string $type, array $extra = array() ): array {
		return array_merge(
			array(
				'id'   => $type . '_field',
				'type' => $type,
			),
			$extra,
		);
	}
}
