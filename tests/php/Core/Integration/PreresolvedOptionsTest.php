<?php
/**
 * Integration axis: the data-preresolved-options map built by the Options
 * integration for async select fields.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core\Integration;

use Wpify\CustomFields\Integrations\Options;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Covers OptionsIntegration::build_preresolved_options() with items in the
 * normalized shape it receives (options_callback + options_key): saved values of
 * dependent selects (cache_options=false, {{placeholder}} async_params) are
 * resolved with the static params only, and the map is filterable.
 */
class PreresolvedOptionsTest extends TestCase {

	/**
	 * Params received by the options callback, per call.
	 *
	 * @var array<int, array>
	 */
	private array $calls = array();

	/**
	 * Cleans filters after each test.
	 */
	public function tear_down(): void {
		remove_all_filters( 'wpifycf_preresolved_options' );
		parent::tear_down();
	}

	/**
	 * Builds an Options page with the given items.
	 *
	 * @param array $items Field definitions.
	 *
	 * @return Options
	 */
	private function options_page( array $items ): Options {
		return $this->cf->create_options_page(
			array(
				'page_title'  => 'PR',
				'menu_title'  => 'PR',
				'menu_slug'   => 'wpcf-pr',
				'option_name' => 'wpcf_pr',
				'items'       => $items,
			)
		);
	}

	/**
	 * Options callback recording its params and labelling values as "Label N".
	 *
	 * @param array $params Params passed by the integration.
	 *
	 * @return array
	 */
	public function options_callback( array $params ): array {
		$this->calls[] = $params;

		$options = array();
		foreach ( (array) ( $params['value'] ?? array() ) as $value ) {
			$options[] = array(
				'value' => $value,
				'label' => 'Label ' . $value,
			);
		}

		return $options;
	}

	/**
	 * A dependent select (cache_options=false) gets its saved value
	 * preresolved; placeholder params are dropped, static ones kept.
	 */
	public function test_cache_options_false_field_is_preresolved_with_static_params(): void {
		$items = array(
			array(
				'id'               => 'term',
				'type'             => 'select',
				'options_callback' => array( $this, 'options_callback' ),
				'options_key'      => 'dependent_terms',
				'cache_options'    => false,
				'async_params'     => array(
					'taxonomy' => '{{#.taxonomy}}',
					'limit'    => 20,
					'scope'    => 'static',
				),
				'value'            => '28',
			),
		);

		$map = $this->options_page( $items )->build_preresolved_options( $items );

		$this->assertSame( array( 'dependent_terms' => array( '28' => 'Label 28' ) ), $map );
		$this->assertCount( 1, $this->calls );
		$this->assertSame(
			array(
				'limit' => 20,
				'scope' => 'static',
				'value' => array( '28' ),
			),
			$this->calls[0]
		);
	}

	/**
	 * The wpifycf_preresolved_options filter can supply labels the callback
	 * cannot produce without its dynamic params.
	 */
	public function test_filter_can_override_labels(): void {
		add_filter(
			'wpifycf_preresolved_options',
			static function ( array $preresolved, array $by_key ) {
				foreach ( $by_key['dependent_terms'] ?? array() as $value ) {
					$preresolved['dependent_terms'][ $value ] = 'Filtered ' . $value;
				}

				return $preresolved;
			},
			10,
			2
		);

		$items = array(
			array(
				'id'               => 'term',
				'type'             => 'select',
				'options_callback' => '__return_empty_array',
				'options_key'      => 'dependent_terms',
				'cache_options'    => false,
				'async_params'     => array( 'taxonomy' => '{{#.taxonomy}}' ),
				'value'            => '30',
			),
		);

		$map = $this->options_page( $items )->build_preresolved_options( $items );

		$this->assertSame( array( 'dependent_terms' => array( '30' => 'Filtered 30' ) ), $map );
	}
}
