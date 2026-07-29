<?php
/**
 * Field definition library for the WPify Custom Fields demo plugin.
 *
 * Provides three builders:
 *  - wcf_demo_showcase_fields(): every field type, organised into tabs.
 *  - wcf_demo_showcase_tabs():   the tab definitions for the showcase.
 *  - wcf_demo_sample_fields():   a small representative set reused on the
 *                                secondary surfaces (metabox, user, etc.).
 *
 * @package WcfDemo
 */

defined( 'ABSPATH' ) || exit;

/**
 * Reusable option lists.
 *
 * @return array<string, string>
 */
function wcf_demo_colors(): array {
	return array(
		'red'   => 'Red',
		'green' => 'Green',
		'blue'  => 'Blue',
	);
}

/**
 * Async options callback for the showcase's `f_async` select. A callable
 * `options` value makes the field resolve its list over REST rather than
 * inline, so the E2E smoke set can exercise the async-select path.
 *
 * @param array<string, mixed> $params Request params: `search`, `value`.
 * @return array<int, array<string, string>>
 */
function wcf_demo_showcase_async_options( array $params ): array {
	$all = array(
		'red'   => 'Async Red',
		'green' => 'Async Green',
		'blue'  => 'Async Blue',
		'amber' => 'Async Amber',
	);

	$search  = isset( $params['search'] ) ? strtolower( (string) $params['search'] ) : '';
	$options = array();

	foreach ( $all as $value => $label ) {
		if ( '' === $search || str_contains( strtolower( $label ), $search ) ) {
			$options[] = array(
				'value' => $value,
				'label' => $label,
			);
		}
	}

	return $options;
}

/**
 * Tab definitions for the all-fields showcase.
 *
 * @return array<string, string>
 */
function wcf_demo_showcase_tabs(): array {
	return array(
		'basic'     => 'Basic inputs',
		'choice'    => 'Choices',
		'datetime'  => 'Date & time',
		'rich'      => 'Rich & visual',
		'media'     => 'Media',
		'relations' => 'Relations',
		'multi'     => 'Repeaters',
		'structure' => 'Structure',
		'special'   => 'Special',
		'logic'     => 'Conditions & validation',
	);
}

/**
 * Every field type, organised by tab. Used on the main showcase options page.
 *
 * @return array<string, array<string, mixed>>
 */
function wcf_demo_showcase_fields(): array {
	$colors      = wcf_demo_colors();
	$upload_dir  = WP_CONTENT_DIR . '/uploads/wcf-demo-files';
	$direct_file = array();

	if ( wp_mkdir_p( $upload_dir ) ) {
		$direct_file = array(
			'f_direct_file' => array(
				'type'          => 'direct_file',
				'label'         => 'Direct file (server upload)',
				'tab'           => 'media',
				'directory'     => $upload_dir,
				'allowed_types' => array( 'application/pdf', 'image/png', 'image/jpeg' ),
				'max_size'      => 5242880,
			),
		);
	}

	// Product pickers search and display the WooCommerce SKU, so they only make
	// sense when WooCommerce is active.
	$product_relations = array();

	if ( class_exists( 'WooCommerce' ) ) {
		$product_relations = array(
			'f_product'       => array(
				'type'      => 'post',
				'label'     => 'Product (searchable by SKU)',
				'tab'       => 'relations',
				'post_type' => 'product',
			),
			'f_multi_product' => array(
				'type'      => 'multi_post',
				'label'     => 'Multi product (searchable by SKU)',
				'tab'       => 'relations',
				'post_type' => array( 'product', 'product_variation' ),
			),
		);
	}

	return array_merge(
		array(
			// --- Basic inputs ---------------------------------------------
			'f_text'             => array(
				'type'    => 'text',
				'label'   => 'Text',
				'tab'     => 'basic',
				'counter' => true,
			),
			'f_textarea'         => array(
				'type'    => 'textarea',
				'label'   => 'Textarea',
				'tab'     => 'basic',
				'counter' => true,
			),
			'f_email'            => array(
				'type'  => 'email',
				'label' => 'Email',
				'tab'   => 'basic',
			),
			'f_url'              => array(
				'type'  => 'url',
				'label' => 'URL',
				'tab'   => 'basic',
			),
			'f_password'         => array(
				'type'  => 'password',
				'label' => 'Password',
				'tab'   => 'basic',
			),
			'f_tel'              => array(
				'type'  => 'tel',
				'label' => 'Telephone',
				'tab'   => 'basic',
			),
			'f_number'           => array(
				'type'  => 'number',
				'label' => 'Number',
				'tab'   => 'basic',
				'min'   => 0,
				'max'   => 100,
			),
			'f_range'            => array(
				'type'  => 'range',
				'label' => 'Range',
				'tab'   => 'basic',
				'min'   => 0,
				'max'   => 100,
				'step'  => 5,
			),
			'f_hidden'           => array(
				'type'  => 'hidden',
				'label' => 'Hidden',
				'tab'   => 'basic',
			),

			// --- Choices --------------------------------------------------
			'f_select'           => array(
				'type'    => 'select',
				'label'   => 'Select',
				'tab'     => 'choice',
				'options' => $colors,
			),
			'f_async'            => array(
				'type'        => 'select',
				'label'       => 'Async select',
				'tab'         => 'choice',
				'options'     => 'wcf_demo_showcase_async_options',
				'options_key' => 'wcf_demo_showcase_async',
			),
			'f_multi_select'     => array(
				'type'    => 'multi_select',
				'label'   => 'Multi select',
				'tab'     => 'choice',
				'options' => $colors,
			),
			'f_radio'            => array(
				'type'    => 'radio',
				'label'   => 'Radio',
				'tab'     => 'choice',
				'options' => $colors,
			),
			'f_checkbox'         => array(
				'type'  => 'checkbox',
				'label' => 'Checkbox',
				'tab'   => 'choice',
				'title' => 'I agree',
			),
			'f_multi_checkbox'   => array(
				'type'    => 'multi_checkbox',
				'label'   => 'Multi checkbox',
				'tab'     => 'choice',
				'options' => $colors,
			),
			'f_toggle'           => array(
				'type'  => 'toggle',
				'label' => 'Toggle',
				'tab'   => 'choice',
				'title' => 'Enabled',
			),
			'f_multi_toggle'     => array(
				'type'    => 'multi_toggle',
				'label'   => 'Multi toggle',
				'tab'     => 'choice',
				'options' => $colors,
			),
			'f_button'           => array(
				'type'   => 'button',
				'label'  => 'Button',
				'tab'    => 'choice',
				'title'  => 'Open wpify.io',
				'url'    => 'https://wpify.io',
				'target' => '_blank',
			),
			'f_multi_button'     => array(
				'type'    => 'multi_button',
				'label'   => 'Multi button',
				'tab'     => 'choice',
				'options' => $colors,
			),

			// --- Date & time ----------------------------------------------
			'f_date'             => array(
				'type'  => 'date',
				'label' => 'Date',
				'tab'   => 'datetime',
			),
			'f_datetime'         => array(
				'type'  => 'datetime',
				'label' => 'Datetime',
				'tab'   => 'datetime',
			),
			'f_time'             => array(
				'type'  => 'time',
				'label' => 'Time',
				'tab'   => 'datetime',
			),
			'f_month'            => array(
				'type'  => 'month',
				'label' => 'Month',
				'tab'   => 'datetime',
			),
			'f_week'             => array(
				'type'  => 'week',
				'label' => 'Week',
				'tab'   => 'datetime',
			),
			'f_date_range'       => array(
				'type'  => 'date_range',
				'label' => 'Date range',
				'tab'   => 'datetime',
			),

			// --- Rich & visual --------------------------------------------
			'f_richtext'         => array(
				'type'    => 'richtext',
				'label'   => 'Rich text (Lexical)',
				'tab'     => 'rich',
				'toolbar' => 'full',
			),
			'f_wysiwyg'          => array(
				'type'   => 'wysiwyg',
				'label'  => 'WYSIWYG (TinyMCE)',
				'tab'    => 'rich',
				'height' => 200,
			),
			'f_code'             => array(
				'type'     => 'code',
				'label'    => 'Code',
				'tab'      => 'rich',
				'language' => 'css',
				'height'   => 200,
			),
			'f_color'            => array(
				'type'  => 'color',
				'label' => 'Color',
				'tab'   => 'rich',
			),

			// --- Media ----------------------------------------------------
			'f_attachment'       => array(
				'type'  => 'attachment',
				'label' => 'Attachment',
				'tab'   => 'media',
			),
			'f_multi_attachment' => array(
				'type'  => 'multi_attachment',
				'label' => 'Gallery (multi attachment)',
				'tab'   => 'media',
			),

			// --- Relations ------------------------------------------------
			'f_post'             => array(
				'type'      => 'post',
				'label'     => 'Post',
				'tab'       => 'relations',
				'post_type' => 'post',
			),
			'f_multi_post'       => array(
				'type'      => 'multi_post',
				'label'     => 'Multi post',
				'tab'       => 'relations',
				'post_type' => array( 'post', 'page' ),
			),
			'f_term'             => array(
				'type'     => 'term',
				'label'    => 'Term',
				'tab'      => 'relations',
				'taxonomy' => 'category',
			),
			'f_multi_term'       => array(
				'type'     => 'multi_term',
				'label'    => 'Multi term',
				'tab'      => 'relations',
				'taxonomy' => 'category',
			),
			'f_link'             => array(
				'type'      => 'link',
				'label'     => 'Link',
				'tab'       => 'relations',
				'post_type' => array( 'post', 'page' ),
			),
			'f_multi_link'       => array(
				'type'      => 'multi_link',
				'label'     => 'Multi link',
				'tab'       => 'relations',
				'post_type' => array( 'post', 'page' ),
			),

			// --- Repeaters (multi_*) --------------------------------------
			'f_multi_text'       => array(
				'type'  => 'multi_text',
				'label' => 'Multi text',
				'tab'   => 'multi',
			),
			'f_multi_textarea'   => array(
				'type'  => 'multi_textarea',
				'label' => 'Multi textarea',
				'tab'   => 'multi',
			),
			'f_multi_email'      => array(
				'type'  => 'multi_email',
				'label' => 'Multi email',
				'tab'   => 'multi',
			),
			'f_multi_url'        => array(
				'type'  => 'multi_url',
				'label' => 'Multi URL',
				'tab'   => 'multi',
			),
			'f_multi_tel'        => array(
				'type'  => 'multi_tel',
				'label' => 'Multi tel',
				'tab'   => 'multi',
			),
			'f_multi_number'     => array(
				'type'  => 'multi_number',
				'label' => 'Multi number',
				'tab'   => 'multi',
			),
			'f_multi_date'       => array(
				'type'  => 'multi_date',
				'label' => 'Multi date',
				'tab'   => 'multi',
			),
			'f_multi_datetime'   => array(
				'type'  => 'multi_datetime',
				'label' => 'Multi datetime',
				'tab'   => 'multi',
			),
			'f_multi_time'       => array(
				'type'  => 'multi_time',
				'label' => 'Multi time',
				'tab'   => 'multi',
			),
			'f_multi_month'      => array(
				'type'  => 'multi_month',
				'label' => 'Multi month',
				'tab'   => 'multi',
			),
			'f_multi_week'       => array(
				'type'  => 'multi_week',
				'label' => 'Multi week',
				'tab'   => 'multi',
			),
			'f_multi_date_range' => array(
				'type'  => 'multi_date_range',
				'label' => 'Multi date range',
				'tab'   => 'multi',
			),
			'f_multi_richtext'   => array(
				'type'  => 'multi_richtext',
				'label' => 'Multi rich text',
				'tab'   => 'multi',
			),

			// --- Structure ------------------------------------------------
			'f_group'            => array(
				'type'  => 'group',
				'label' => 'Group (nested values)',
				'tab'   => 'structure',
				'items' => array(
					'name'  => array(
						'type'  => 'text',
						'label' => 'Name',
					),
					'email' => array(
						'type'  => 'email',
						'label' => 'Email',
					),
				),
			),
			'f_multi_group'      => array(
				'type'  => 'multi_group',
				'label' => 'Multi group (repeater of groups)',
				'tab'   => 'structure',
				'items' => array(
					'title' => array(
						'type'  => 'text',
						'label' => 'Title',
					),
					'color' => array(
						'type'    => 'select',
						'label'   => 'Color',
						'options' => $colors,
					),
				),
			),
			'f_columns'          => array(
				'type'    => 'columns',
				'label'   => 'Columns (flat values)',
				'tab'     => 'structure',
				'columns' => 2,
				'items'   => array(
					'first_name' => array(
						'type'  => 'text',
						'label' => 'First name',
					),
					'last_name'  => array(
						'type'  => 'text',
						'label' => 'Last name',
					),
				),
			),
			'f_wrapper'          => array(
				'type'  => 'wrapper',
				'label' => 'Wrapper (flat values)',
				'tab'   => 'structure',
				'items' => array(
					'street' => array(
						'type'  => 'text',
						'label' => 'Street',
					),
					'city'   => array(
						'type'  => 'text',
						'label' => 'City',
					),
				),
			),
			'f_title'            => array(
				'type'  => 'title',
				'title' => 'Title (display only)',
				'tab'   => 'structure',
			),
			'f_html'             => array(
				'type'    => 'html',
				'tab'     => 'structure',
				'content' => '<p>This is an <strong>html</strong> display field — no input, just markup.</p>',
			),

			// --- Special --------------------------------------------------
			'f_mapycz'           => array(
				'type'        => 'mapycz',
				'label'       => 'Mapy.cz map',
				'tab'         => 'special',
				'lang'        => 'en',
				'description' => 'Prompts for a Mapy.cz API key on first use.',
			),
			'f_multi_mapycz'     => array(
				'type'  => 'multi_mapycz',
				'label' => 'Multi Mapy.cz',
				'tab'   => 'special',
				'lang'  => 'en',
			),
			'f_cloudflare'       => array(
				'type'        => 'cloudflare',
				'label'       => 'Cloudflare zone',
				'tab'         => 'special',
				'description' => 'Prompts for Cloudflare email + Global API key on first use.',
			),
		),
		$direct_file,
		$product_relations,
		array(
			// --- Conditions & validation ----------------------------------
			'f_required'    => array(
				'type'     => 'text',
				'label'    => 'Required text',
				'tab'      => 'logic',
				'required' => true,
			),
			'f_valid_email' => array(
				'type'     => 'email',
				'label'    => 'Email (validated)',
				'tab'      => 'logic',
				'required' => true,
			),
			'f_valid_num'   => array(
				'type'  => 'number',
				'label' => 'Number 10-20',
				'tab'   => 'logic',
				'min'   => 10,
				'max'   => 20,
			),
			'f_uuid'        => array(
				'type'      => 'text',
				'label'     => 'UUID (auto-generated)',
				'tab'       => 'logic',
				'generator' => 'uuid',
			),
			'f_cond_toggle' => array(
				'type'  => 'toggle',
				'label' => 'Show secret field?',
				'tab'   => 'logic',
				'title' => 'Reveal',
			),
			'f_cond_target' => array(
				'type'       => 'text',
				'label'      => 'Secret field',
				'tab'        => 'logic',
				'conditions' => array(
					array(
						'field' => 'f_cond_toggle',
						'value' => true,
					),
				),
			),
		)
	);
}

/**
 * A small representative field set reused on secondary surfaces.
 *
 * @param string|null $tab Optional tab id to assign every field to.
 * @return array<string, array<string, mixed>>
 */
function wcf_demo_sample_fields( ?string $tab = null ): array {
	$fields = array(
		'sample_text'    => array(
			'type'     => 'text',
			'label'    => 'Sample text',
			'required' => true,
		),
		'sample_select'  => array(
			'type'    => 'select',
			'label'   => 'Sample select',
			'options' => wcf_demo_colors(),
		),
		'sample_toggle'  => array(
			'type'  => 'toggle',
			'label' => 'Sample toggle',
			'title' => 'Enable extra',
		),
		'sample_extra'   => array(
			'type'       => 'wysiwyg',
			'label'      => 'Extra content',
			'height'     => 150,
			'conditions' => array(
				array(
					'field' => 'sample_toggle',
					'value' => true,
				),
			),
		),
		'sample_gallery' => array(
			'type'  => 'multi_attachment',
			'label' => 'Sample gallery',
		),
		'sample_group'   => array(
			'type'  => 'group',
			'label' => 'Sample group',
			'items' => array(
				'subtitle' => array(
					'type'  => 'text',
					'label' => 'Subtitle',
				),
				'color'    => array(
					'type'  => 'color',
					'label' => 'Color',
				),
			),
		),
	);

	if ( null !== $tab ) {
		foreach ( $fields as &$field ) {
			$field['tab'] = $tab;
		}
		unset( $field );
	}

	return $fields;
}
