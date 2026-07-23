<?php
/**
 * Plugin Name: WCF Demo (all surfaces)
 * Description: Companion plugin that registers WPify Custom Fields on every integration surface for browser testing. Not for production.
 * Version: 1.0.0
 * Author: WPify
 * Network: true
 * Requires Plugins: wpify-custom-fields
 *
 * @package WcfDemo
 */

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/includes/fields.php';
require_once __DIR__ . '/includes/async-dedup.php';

/**
 * Register every surface once WordPress (and optionally WooCommerce) is ready.
 * Guarded so the demo never fatals when an optional dependency is absent.
 */
add_action( 'init', 'wcf_demo_register', 9 );

/**
 * Block themes (the WP default) hide the classic Menus screen unless the theme
 * declares menu support. Enable it so the Menu Item integration is testable.
 */
add_action(
	'after_setup_theme',
	static function (): void {
		add_theme_support( 'menus' );
	},
	11
);

/**
 * Registers every demo integration surface once all plugins are loaded.
 */
function wcf_demo_register(): void {
	if ( ! function_exists( 'wpify_custom_fields' ) ) {
		return;
	}

	$cf = wpify_custom_fields();

	wcf_demo_register_core( $cf );

	// Reproduction case: duplicate async option requests across identical fields.
	wcf_demo_register_async_dedup( $cf );

	if ( is_multisite() ) {
		wcf_demo_register_multisite( $cf );
	}

	if ( class_exists( 'WooCommerce' ) ) {
		wcf_demo_register_woocommerce( $cf );
	}

	if ( class_exists( 'WC_Subscriptions' ) ) {
		wcf_demo_register_subscriptions( $cf );
	}

	if ( class_exists( 'WC_Memberships' ) || function_exists( 'wc_memberships' ) ) {
		wcf_demo_register_memberships( $cf );
	}
}

/**
 * WordPress core surfaces: options page (all fields), metabox, taxonomy,
 * user, comment, menu item, Gutenberg block.
 *
 * @param \Wpify\CustomFields\CustomFields $cf Custom fields instance.
 */
function wcf_demo_register_core( $cf ): void {
	// 1. Options page — the all-field-types showcase.
	$cf->create_options_page(
		array(
			'type'        => \Wpify\CustomFields\Integrations\Options::TYPE_OPTIONS,
			'page_title'  => 'WCF Demo — All Fields',
			'menu_title'  => 'WCF Demo',
			'menu_slug'   => 'wcf-demo',
			'capability'  => 'manage_options',
			'position'    => 2,
			'icon'        => 'dashicons-screenoptions',
			'option_name' => 'wcf_demo_showcase',
			'tabs'        => wcf_demo_showcase_tabs(),
			'items'       => wcf_demo_showcase_fields(),
		)
	);

	// 2. Metabox — posts and pages.
	$cf->create_metabox(
		array(
			'id'         => 'wcf_demo_metabox',
			'title'      => 'WCF Demo Metabox',
			'post_types' => array( 'post', 'page' ),
			'tabs'       => array( 'demo' => 'Demo fields' ),
			'items'      => wcf_demo_sample_fields( 'demo' ),
		)
	);

	// 3. Taxonomy term fields — categories.
	$cf->create_taxonomy_options(
		array(
			'id'       => 'wcf_demo_taxonomy',
			'taxonomy' => 'category',
			'tabs'     => array( 'demo' => 'Demo fields' ),
			'items'    => wcf_demo_sample_fields( 'demo' ),
		)
	);

	// 4. User profile fields.
	$cf->create_user_options(
		array(
			'id'    => 'wcf_demo_user',
			'title' => 'WCF Demo User Fields',
			'tabs'  => array( 'demo' => 'Demo fields' ),
			'items' => wcf_demo_sample_fields( 'demo' ),
		)
	);

	// 5. Comment meta fields.
	$cf->create_comment_metabox(
		array(
			'id'    => 'wcf_demo_comment',
			'title' => 'WCF Demo Comment Fields',
			'items' => wcf_demo_sample_fields(),
		)
	);

	// 6. Nav menu item fields.
	$cf->create_menu_item_options(
		array(
			'id'    => 'wcf_demo_menu_item',
			'title' => 'WCF Demo Menu Item Fields',
			'items' => wcf_demo_sample_fields(),
		)
	);

	// 7. Gutenberg block.
	$cf->create_gutenberg_block(
		array(
			'name'            => 'wcf-demo/showcase',
			'title'           => 'WCF Demo Block',
			'category'        => 'widgets',
			'icon'            => 'screenoptions',
			'description'     => 'Demonstrates WPify Custom Fields inside a Gutenberg block.',
			'render_callback' => function ( array $attributes, string $content ): string {
				$text = isset( $attributes['sample_text'] ) ? $attributes['sample_text'] : '';
				return '<div class="wcf-demo-block"><strong>WCF Demo Block:</strong> ' . esc_html( $text ) . $content . '</div>';
			},
			'tabs'            => array( 'demo' => 'Demo fields' ),
			'items'           => array_merge(
				wcf_demo_sample_fields( 'demo' ),
				array(
					'sample_inner' => array(
						'type'        => 'inner_blocks',
						'label'       => 'Inner blocks',
						'description' => 'Nested core blocks.',
						'tab'         => 'demo',
					),
				)
			),
		)
	);
}

/**
 * Multisite surfaces: network options page and per-site options page.
 *
 * @param \Wpify\CustomFields\CustomFields $cf Custom fields instance.
 */
function wcf_demo_register_multisite( $cf ): void {
	// 8. Network options page (Network Admin → WCF Demo Network).
	$cf->create_options_page(
		array(
			'type'        => \Wpify\CustomFields\Integrations\Options::TYPE_NETWORK,
			'page_title'  => 'WCF Demo — Network',
			'menu_title'  => 'WCF Demo Network',
			'menu_slug'   => 'wcf-demo-network',
			'capability'  => 'manage_network_options',
			'position'    => 2,
			'option_name' => 'wcf_demo_network',
			'items'       => wcf_demo_sample_fields(),
		)
	);

	// 9. Site options page (Network Admin → Sites context).
	$cf->create_site_options(
		array(
			'page_title'  => 'WCF Demo — Site',
			'menu_title'  => 'WCF Demo Site',
			'menu_slug'   => 'wcf-demo-site',
			'option_name' => 'wcf_demo_site',
			'items'       => wcf_demo_sample_fields(),
		)
	);
}

/**
 * WooCommerce surfaces: product options, variation options, coupon options,
 * order metabox, settings tab.
 *
 * @param \Wpify\CustomFields\CustomFields $cf Custom fields instance.
 */
function wcf_demo_register_woocommerce( $cf ): void {
	// 10. Product data tab.
	$cf->create_product_options(
		array(
			'tab'   => array(
				'label'    => 'WCF Demo',
				'priority' => 80,
			),
			'items' => wcf_demo_sample_fields(),
		)
	);

	// 11. Product variation fields.
	$cf->create_product_variation_options(
		array(
			'tab'   => array( 'label' => 'WCF Demo' ),
			'items' => wcf_demo_sample_fields(),
		)
	);

	// 12. Coupon fields.
	$cf->create_coupon_options(
		array(
			'tab'   => array(
				'label'    => 'WCF Demo',
				'priority' => 80,
			),
			'items' => wcf_demo_sample_fields(),
		)
	);

	// 13. Order metabox (HPOS compatible). Order/subscription use 'name' keys.
	$cf->create_order_metabox(
		array(
			'id'    => 'wcf_demo_order',
			'title' => 'WCF Demo Order Fields',
			'items' => wcf_demo_named_fields(),
		)
	);

	// 14. WooCommerce settings tab.
	$cf->create_woocommerce_settings(
		array(
			'tab'         => array(
				'id'    => 'wcf_demo_settings',
				'label' => 'WCF Demo',
			),
			'section'     => array(
				'id'    => '',
				'label' => 'General',
			),
			'option_name' => 'wcf_demo_wc_settings',
			'items'       => wcf_demo_sample_fields(),
		)
	);
}

/**
 * WooCommerce Subscriptions surface.
 *
 * @param \Wpify\CustomFields\CustomFields $cf Custom fields instance.
 */
function wcf_demo_register_subscriptions( $cf ): void {
	// 15. Subscription metabox.
	$cf->create_subscription_metabox(
		array(
			'id'    => 'wcf_demo_subscription',
			'title' => 'WCF Demo Subscription Fields',
			'items' => wcf_demo_named_fields(),
		)
	);
}

/**
 * WooCommerce Memberships surface.
 *
 * @param \Wpify\CustomFields\CustomFields $cf Custom fields instance.
 */
function wcf_demo_register_memberships( $cf ): void {
	// 16. Membership plan options.
	$cf->create_membership_plan_options(
		array(
			'tab'   => array(
				'label'    => 'WCF Demo',
				'priority' => 80,
			),
			'items' => wcf_demo_sample_fields(),
		)
	);
}

/**
 * Sample fields keyed by 'name' (order/subscription metaboxes store meta by name).
 *
 * @return array<int, array<string, mixed>>
 */
function wcf_demo_named_fields(): array {
	$named = array();
	foreach ( wcf_demo_sample_fields() as $id => $field ) {
		$field['name'] = $id;
		$named[]       = $field;
	}
	return $named;
}
