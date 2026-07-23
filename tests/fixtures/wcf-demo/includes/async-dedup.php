<?php
/**
 * Reproduction case: duplicate async option requests.
 *
 * Several `select` / `multi_select` fields share the SAME options callback,
 * the SAME `options_key` (the "list_id") and the SAME `async_params`. Each one
 * still fires its own request to `/wpifycf/v1/options/<options_key>` on load,
 * so the identical option list is fetched once per field instead of once total.
 * With many such fields — or a repeater whose row holds an async select — this
 * multiplies into many redundant, near-identical API calls.
 *
 * How to observe it on the "WCF Demo — Async Dedup" options page:
 *   - Open the browser Network tab and filter by `options/`. You will see one
 *     request to `options/wcf_demo_async_colors` per async field on the page
 *     (the only differing query arg is `value=`, the field's own selection).
 *   - Or tail the server log (debug.log) for the `[wcf-demo async-dedup]` lines
 *     and read the live counter printed in the page's intro note + the
 *     "Server-side call count" field after each reload.
 *   - Add rows to the repeater to watch the call count climb further.
 *
 * @package WcfDemo
 */

defined( 'ABSPATH' ) || exit;

/**
 * Shared options_key ("list_id") used by every async field below, so they all
 * resolve to the exact same REST endpoint and callback.
 */
const WCF_DEMO_ASYNC_KEY = 'wcf_demo_async_colors';

/**
 * Transient that records how many times the shared callback has run. Lets us
 * prove duplicate calls server-side without reading the browser Network tab.
 */
const WCF_DEMO_ASYNC_COUNTER = 'wcf_demo_async_call_count';

/**
 * The shared async options callback.
 *
 * Records every REST invocation and sleeps briefly so the cost of fetching the
 * same list many times is observable. Returns a deliberately large list so the
 * redundancy actually hurts (payload + DB/compute repeated per field).
 *
 * @param array<string, mixed> $params Request params: `search`, `value`, plus
 *                                      anything from `async_params`.
 * @return array<int, array<string, string>>
 */
function wcf_demo_async_colors_callback( array $params ): array {
	$count = (int) get_transient( WCF_DEMO_ASYNC_COUNTER );
	set_transient( WCF_DEMO_ASYNC_COUNTER, ++$count, HOUR_IN_SECONDS );

	// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- dev fixture: the log line is the observable output of this dedup test bed.
	error_log(
		sprintf(
			'[wcf-demo async-dedup] options call #%d  search=%s value=%s',
			$count,
			isset( $params['search'] ) ? (string) $params['search'] : '',
			isset( $params['value'] ) ? wp_json_encode( $params['value'] ) : ''
		)
	);

	// Simulate a non-trivial list so repeated fetches are visibly expensive.
	usleep( 150000 ); // 150ms per call.

	// Full universe of options.
	$all = array();
	foreach ( range( 1, 1000 ) as $i ) {
		$all[ 'color-' . $i ] = sprintf( 'Color #%03d', $i );
	}

	$search = isset( $params['search'] ) ? (string) $params['search'] : '';
	$values = array_map( 'strval', (array) ( $params['value'] ?? array() ) );

	// Realistic endpoint: always include explicitly-requested value(s) (so a
	// selected option's label resolves even when it's outside the browse
	// window), plus a capped search window. This means a value beyond the
	// window is NOT returned by a value-free browse — its label can only come
	// from the preresolved map / resolve request.
	$result = array();
	foreach ( $values as $value ) {
		if ( isset( $all[ $value ] ) ) {
			$result[ $value ] = $all[ $value ];
		}
	}

	$matched = 0;
	foreach ( $all as $value => $label ) {
		if ( isset( $result[ $value ] ) ) {
			continue;
		}
		if ( '' === $search || false !== stripos( $label, $search ) ) {
			$result[ $value ] = $label;
			if ( ++$matched >= 50 ) {
				break;
			}
		}
	}

	$options = array();
	foreach ( $result as $value => $label ) {
		$options[] = array(
			'value' => $value,
			'label' => $label,
		);
	}

	return $options;
}

/**
 * Builds one async field that shares the common callback, options_key and
 * async_params — i.e. "the same settings" from the bug report. Used as the
 * building block for every test cell (bare / group / multi_group).
 *
 * @param string $label Field label.
 * @param string $type  `select` or `multi_select`.
 * @return array<string, mixed>
 */
function wcf_demo_async_field( string $label, string $type = 'select' ): array {
	return array(
		'type'         => $type,
		'label'        => $label,
		'options'      => 'wcf_demo_async_colors_callback',
		'options_key'  => WCF_DEMO_ASYNC_KEY,        // Same "list_id" for all.
		'async_params' => array( 'context' => 'demo' ), // Same async params for all.
	);
}

/**
 * Pre-filled values for every test cell, so the page always starts with the
 * fields populated (this is the baseline to test the caching fix against).
 * Seeded once into the page's option; the user can freely edit/save afterwards.
 *
 * Structure mirrors how the Options integration stores values under
 * `option_name`: top-level keyed by field id, groups as nested objects, and
 * multi_group as an array of row objects.
 *
 * @return array<string, mixed>
 */
function wcf_demo_async_seed_data(): array {
	return array(
		'bare_select'   => 'color-900',
		'bare_multi'    => array( 'color-2', 'color-3', 'color-4' ),
		'legacy_select' => 'color-20',
		'group_fields'  => array(
			'group_select' => 'color-5',
			'group_multi'  => array( 'color-6', 'color-7' ),
		),
		'repeater'      => array(
			array(
				'row_select' => 'color-8',
				'row_multi'  => array( 'color-9', 'color-10' ),
			),
			array(
				'row_select' => 'color-11',
				'row_multi'  => array( 'color-12', 'color-13' ),
			),
		),
	);
}

/**
 * Registers the reproduction options page.
 *
 * @param \Wpify\CustomFields\CustomFields $cf Custom fields instance.
 */
function wcf_demo_register_async_dedup( $cf ): void {
	$call_count = (int) get_transient( WCF_DEMO_ASYNC_COUNTER );

	// Seed the baseline values once so every field is filled on first load.
	if ( false === get_option( 'wcf_demo_async_dedup', false ) ) {
		update_option( 'wcf_demo_async_dedup', wcf_demo_async_seed_data() );
	}

	$items = array(
		'intro'      => array(
			'type'    => 'html',
			'content' => sprintf(
				'<div style="padding:12px;border-left:4px solid #d63638;background:#fff;">'
				. '<strong>Async caching test bed.</strong> Every <code>select</code> / '
				. '<code>multi_select</code> below is async and shares the same '
				. '<code>options_key=%1$s</code>, callback and <code>async_params</code> — '
				. 'covering all three contexts: <strong>bare</strong>, inside a '
				. '<strong>group</strong>, and inside a <strong>multi_group</strong> repeater. '
				. 'All fields are pre-filled with saved values as the baseline.<br>'
				. 'Open the Network tab (filter <code>options/</code>) and count requests to '
				. '<code>/wpifycf/v1/options/%1$s</code>; today each field fires its own '
				. '(differing only by <code>value=</code>).'
				. '<br><strong>Server-side callback calls since last reset: %2$d.</strong> '
				. '<a href="%3$s">Reset counter</a>.</div>',
				esc_html( WCF_DEMO_ASYNC_KEY ),
				$call_count,
				esc_url( add_query_arg( 'wcf_demo_reset_async', '1' ) )
			),
		),
		'call_count' => array(
			'type'        => 'number',
			'label'       => 'Server-side call count (read-only)',
			'description' => 'Total times the shared callback ran. Resets via the link in the note.',
			'attributes'  => array( 'readonly' => 'readonly' ),
			'default'     => $call_count,
		),
	);

	// Test matrix: select + multi_select in three contexts (bare / group /
	// multi_group), every field async and sharing the same options_key,
	// callback and async_params. All pre-filled via wcf_demo_async_seed_data().

	// --- BARE (top-level) ---------------------------------------------------
	$items['bare_select'] = wcf_demo_async_field( 'Bare select', 'select' );
	$items['bare_multi']  = wcf_demo_async_field( 'Bare multi select', 'multi_select' );

	// Legacy opt-out: cache_options=false keeps the old behavior (value sent in
	// the browse request, excluded from the preresolved map) for callbacks that
	// depend on value when returning the browse list.
	$legacy_select                  = wcf_demo_async_field( 'Bare select (cache_options=false)', 'select' );
	$legacy_select['cache_options'] = false;
	$items['legacy_select']         = $legacy_select;

	// --- Inside a GROUP -----------------------------------------------------
	$items['group_fields'] = array(
		'type'  => 'group',
		'label' => 'Group — async select + multi_select',
		'items' => array(
			'group_select' => wcf_demo_async_field( 'Group select', 'select' ),
			'group_multi'  => wcf_demo_async_field( 'Group multi select', 'multi_select' ),
		),
	);

	// --- Inside a MULTI_GROUP (repeater) ------------------------------------
	$items['repeater'] = array(
		'type'  => 'multi_group',
		'label' => 'Repeater (multi_group) — async select + multi_select per row',
		'items' => array(
			'row_select' => wcf_demo_async_field( 'Row select', 'select' ),
			'row_multi'  => wcf_demo_async_field( 'Row multi select', 'multi_select' ),
		),
	);

	$cf->create_options_page(
		array(
			'type'        => \Wpify\CustomFields\Integrations\Options::TYPE_OPTIONS,
			'page_title'  => 'WCF Demo — Async Dedup',
			'menu_title'  => 'WCF Async Dedup',
			'menu_slug'   => 'wcf-demo-async-dedup',
			'capability'  => 'manage_options',
			'position'    => 3,
			'icon'        => 'dashicons-update',
			'option_name' => 'wcf_demo_async_dedup',
			'items'       => $items,
		)
	);

	// Same matrix, but as a Gutenberg block — a DIFFERENT code path. A block has
	// no server-side prepare_items_for_js / DB lookup: its values live in the
	// editor's block attributes (defaults below), and the fields are registered
	// once without per-instance values. So a server-side "preresolve selected
	// labels" fix cannot reach a block and would fail SILENTLY here — the selects
	// would render with empty labels once `value` is dropped from the request.
	// This block is the regression guard for exactly that.
	wcf_demo_register_async_dedup_block( $cf );
}

/**
 * The async test matrix as block items, pre-filled via per-field defaults.
 *
 * For Gutenberg, group/multi_group are single block attributes (flatten_items
 * does not flatten them), so the baseline value is supplied as a composite
 * `default` on the group / repeater itself rather than on each child.
 *
 * @return array<string, mixed>
 */
function wcf_demo_async_block_items(): array {
	$seed = wcf_demo_async_seed_data();

	$bare_select            = wcf_demo_async_field( 'Bare select', 'select' );
	$bare_select['default'] = $seed['bare_select'];

	$bare_multi            = wcf_demo_async_field( 'Bare multi select', 'multi_select' );
	$bare_multi['default'] = $seed['bare_multi'];

	return array(
		'bare_select'  => $bare_select,
		'bare_multi'   => $bare_multi,
		'group_fields' => array(
			'type'    => 'group',
			'label'   => 'Group — async select + multi_select',
			'default' => $seed['group_fields'],
			'items'   => array(
				'group_select' => wcf_demo_async_field( 'Group select', 'select' ),
				'group_multi'  => wcf_demo_async_field( 'Group multi select', 'multi_select' ),
			),
		),
		'repeater'     => array(
			'type'    => 'multi_group',
			'label'   => 'Repeater (multi_group) — async select + multi_select per row',
			'default' => $seed['repeater'],
			'items'   => array(
				'row_select' => wcf_demo_async_field( 'Row select', 'select' ),
				'row_multi'  => wcf_demo_async_field( 'Row multi select', 'multi_select' ),
			),
		),
	);
}

/**
 * Registers the Gutenberg block carrying the async test matrix.
 *
 * @param \Wpify\CustomFields\CustomFields $cf Custom fields instance.
 */
function wcf_demo_register_async_dedup_block( $cf ): void {
	$cf->create_gutenberg_block(
		array(
			'name'            => 'wcf-demo/async-dedup',
			'title'           => 'WCF Async Dedup (block)',
			'category'        => 'widgets',
			'icon'            => 'update',
			'description'     => 'Async select/multi_select caching test bed inside a Gutenberg block (bare / group / multi_group), pre-filled via attribute defaults.',
			// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- signature dictated by GutenbergBlock::render_callback.
			'render_callback' => static function ( array $attributes, string $content ): string {
				return '<div class="wcf-demo-async-dedup-block"><strong>WCF Async Dedup block</strong> — async fields are edited in the block editor.</div>';
			},
			'items'           => wcf_demo_async_block_items(),
		)
	);
}

/**
 * Tiny helper to reset the call counter via `?wcf_demo_reset_async=1`.
 */
add_action(
	'admin_init',
	static function (): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only reset flag guarded by capability check; dev fixture.
		if ( isset( $_GET['wcf_demo_reset_async'] ) && current_user_can( 'manage_options' ) ) {
			delete_transient( WCF_DEMO_ASYNC_COUNTER );
		}
	}
);
