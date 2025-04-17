# Inner Blocks Field Type

This is a special field type for Gutenberg blocks only. It allows you to create nested blocks within a block. This is useful when you want to create a block that contains other blocks.

## Field Type: `inner_blocks`

```php
array(
	'type'           => 'inner_blocks',
	'id'             => 'example_inner_blocks',
	'label'          => 'Example Inner Blocks',
	'template'       => array(
		array(
			'core/paragraph',
			array(
				'placeholder' => 'Write something...',
			),
		),
		array(
			'core/image',
			array(
				'align' => 'left',
			),
		),
	),
	'template_lock'   => 'all',
	'orientation'     => 'horizontal',
	'allowed_blocks'  => array(
		'core/paragraph',
		'core/image',
	),
)
```

## Properties

See detailed explanation in WordPress documentation: [Nested Blocks: Using InnerBlocks](https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/nested-blocks-inner-blocks/).

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `inner_blocks` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(mixed)_ - Default value for the field
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `template` _(array)_

Use the template property to define a set of blocks that prefill the InnerBlocks component when inserted. You can set attributes on the blocks to define their use. The example below shows a book review template using InnerBlocks component and setting placeholders values to show the block usage.

#### `template_lock` _(string)_

Use the templateLock property to lock down the template. Using all locks the template completely so no changes can be made. Using insert prevents additional blocks from being inserted, but existing blocks can be reordered. Possible values are:

- `contentOnly` — prevents all operations. Additionally, the block types that don't have content are hidden from the list view and can't gain focus within the block list. Unlike the other lock types, this is not overrideable by children.
- `all` — prevents all operations. It is not possible to insert new blocks. Move existing blocks or delete them.
- `insert` — prevents inserting or removing blocks, but allows moving existing ones.
- `false` — prevents locking from being applied to an InnerBlocks area even if a parent block contains locking. (Boolean)

#### `orientation` _(string)_

By default, InnerBlocks expects its blocks to be shown in a vertical list. A valid use-case is to style inner blocks to appear horizontally, for instance by adding CSS flex or grid properties to the inner blocks wrapper. When blocks are styled in such a way, the orientation prop can be set to indicate that a horizontal layout is being used.

- `horizontal` - Horizontal orientation.
- `vertical` - Vertical orientation.

#### `allowed_blocks` _(array)_

Using the allowedBlocks prop, you can further limit, in addition to the allowedBlocks field in block.json, which blocks can be inserted as direct descendants of this block. It is useful to determine the list of allowed blocks dynamically, individually for each block. For example, determined by a block attribute.

## Example Usage

```php
// Define a custom Gutenberg block with inner blocks
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
				'allowed_blocks'  => array( 'core/heading', 'core/paragraph', 'core/image', 'core/list' ),
				'template_lock'   => 'insert',
			),
		),
	)
);
```

## Notes

- The Inner Blocks field type is only for use in Gutenberg blocks
- It allows nested blocks within your custom block
- Templates help guide users by pre-populating with specific blocks
- Template locks control what users can modify
- This field doesn't store a value itself - it just provides a container for other blocks
