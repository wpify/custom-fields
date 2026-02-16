# Inner Blocks Field Type

The Inner Blocks field type is a special Gutenberg-only field that allows you to create nested blocks within a custom block. It provides a container for other WordPress blocks with optional templates and locking controls.

## Field Type: `inner_blocks`

```php
array(
	'type'           => 'inner_blocks',
	'id'             => 'example_inner_blocks',
	'label'          => 'Content Blocks',
	'allowed_blocks' => array(
		'core/paragraph',
		'core/heading',
	),
	'template'       => array(
		array( 'core/paragraph', array( 'placeholder' => 'Write something...' ) ),
		array( 'core/image', array( 'align' => 'left' ) ),
	),
	'template_lock'  => 'all',
	'orientation'    => 'horizontal',
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

See also the WordPress documentation: [Nested Blocks: Using InnerBlocks](https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/nested-blocks-inner-blocks/).

### Specific Properties

#### `allowed_blocks` _(array)_ — Optional

An array of block type slugs that can be inserted as direct descendants of this block. Useful for limiting which blocks are available within the inner blocks area, and can be determined dynamically per block instance.

#### `template` _(array)_ — Optional

Defines a set of blocks that prefill the InnerBlocks component when inserted. Each entry is an array containing the block name and an array of block attributes.

#### `template_lock` _(string)_ — Optional

Controls how users can modify the template. Possible values:

- `'contentOnly'` — Prevents all operations. Block types without content are hidden from the list view and cannot gain focus. Not overridable by children.
- `'all'` — Prevents all operations. No inserting, moving, or deleting blocks.
- `'insert'` — Prevents inserting or removing blocks, but allows moving existing ones.
- `false` _(boolean)_ — Prevents locking from being applied even if a parent block contains locking.

#### `orientation` _(string)_ — Optional

Indicates the layout direction of inner blocks. Defaults to vertical. Useful when styling inner blocks with CSS flex or grid for horizontal layouts.

- `'horizontal'` — Horizontal orientation.
- `'vertical'` — Vertical orientation.

## Stored Value

The Inner Blocks field does not store a value itself. It provides a container for other WordPress blocks, whose content is managed by the Gutenberg block editor.

## Example Usage

### Basic Gutenberg Block with Inner Blocks

```php
wpify_custom_fields()->create_gutenberg_block(
	array(
		'id'          => 'custom-container',
		'title'       => 'Custom Container',
		'description' => 'A container block with predefined inner blocks',
		'category'    => 'design',
		'icon'        => 'layout',
		'items'       => array(
			'container_style' => array(
				'type'    => 'select',
				'label'   => 'Container Style',
				'options' => array(
					'default' => 'Default Style',
					'boxed'   => 'Boxed Style',
					'full'    => 'Full Width',
				),
			),
			'container_content' => array(
				'type'           => 'inner_blocks',
				'label'          => 'Container Content',
				'template'       => array(
					array( 'core/heading', array() ),
					array( 'core/paragraph', array( 'placeholder' => 'Add content here...' ) ),
				),
				'allowed_blocks' => array( 'core/heading', 'core/paragraph', 'core/image', 'core/list' ),
				'template_lock'  => 'insert',
			),
		),
	)
);
```

### Rendering Inner Blocks with a Callback

To display inner blocks on the front end, use the `<!-- inner_blocks -->` placeholder in your block's `render_callback`. This placeholder is replaced with an interactive InnerBlocks component in the editor and with the rendered nested block content on the front end.

```php
wpify_custom_fields()->create_gutenberg_block(
	array(
		'name'            => 'wpify/card-block',
		'title'           => 'Card Block',
		'render_callback' => function ( array $attributes, string $content, WP_Block $block ) {
			$style = esc_attr( $attributes['card_style'] ?? 'default' );

			return sprintf(
				'<div class="card card--%s">
					<div class="card__header">
						<h3>%s</h3>
					</div>
					<div class="card__content">
						<!-- inner_blocks -->
					</div>
				</div>',
				$style,
				esc_html( $attributes['card_title'] ?? '' )
			);
		},
		'items'           => array(
			'card_title'   => array(
				'type'  => 'text',
				'label' => 'Card Title',
			),
			'card_style'   => array(
				'type'     => 'select',
				'label'    => 'Card Style',
				'options'  => array(
					'default'  => 'Default',
					'outlined' => 'Outlined',
					'elevated' => 'Elevated',
				),
				'position' => 'inspector',
			),
			'card_content' => array(
				'type'           => 'inner_blocks',
				'label'          => 'Card Content',
				'template'       => array(
					array( 'core/paragraph', array( 'placeholder' => 'Add card content...' ) ),
				),
				'allowed_blocks' => array( 'core/paragraph', 'core/heading', 'core/image', 'core/list' ),
			),
		),
	)
);
```

The placeholder supports variations: `<!-- inner_blocks -->`, `<!-- inner_blocks/ -->`, or `<!-- inner_blocks / -->`.

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->inner_blocks(
	label: 'Content Blocks',
	allowed_blocks: array( 'core/paragraph', 'core/heading' ),
	template_lock: 'all',
);
```

## Notes

- The Inner Blocks field type is only available in Gutenberg blocks context
- It allows nested blocks within your custom block and does not store a value itself
- Templates help guide users by pre-populating with specific blocks
- Template locks control what users can modify within the inner blocks area
- Use the `<!-- inner_blocks -->` placeholder in `render_callback` to position inner blocks in both the editor preview and front-end output
- Only one `inner_blocks` field is allowed per block
