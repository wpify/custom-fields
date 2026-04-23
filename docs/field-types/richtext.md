# Rich Text Field Type

The Rich Text field type provides a modern rich text editor powered by [Lexical](https://lexical.dev/) with a fully configurable toolbar, visual ↔ code view toggle, floating link editor, and word/character counter.

## Field Type: `richtext`

	array(
		'type'    => 'richtext',
		'id'      => 'example_richtext',
		'label'   => 'Content',
		'toolbar' => 'full',
	)

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `toolbar` _(string|array)_ — Optional

Preset name or explicit array of button IDs. Accepts `'full'` (default), `'basic'`, `'minimal'`, or an array like `array( 'format:bold', 'format:italic', '|', 'insert:link' )`. Unknown button IDs are silently skipped.

Available button IDs:

- Blocks: `block:paragraph`, `block:h1`–`block:h6`, `block:pre`, `block:code-block`, `block:blockquote` (render as a single dropdown)
- Inline format: `format:bold`, `format:italic`, `format:strikethrough`
- Lists: `list:ul`, `list:ol`
- Alignment: `align:left`, `align:center`, `align:right`, `align:justify`
- Inserts: `insert:link`, `insert:hr`, `insert:image`, `insert:table`, `insert:special-char`
- Indent: `indent:increase`, `indent:decrease`
- Actions: `action:paste-as-text`, `action:clear-formatting`
- History: `history:undo`, `history:redo`
- View: `view:toggle-code`
- Separator: `'|'`

#### `height` _(integer)_ — Optional

The minimum height of the editor body in pixels. Defaults to `300`.

#### `word_count` _(boolean)_ — Optional

Show the word/character counter footer. Defaults to `true`.

#### `default_view` _(string)_ — Optional

Initial view — `'visual'` (default) or `'code'`. Ignored if the toolbar does not include `view:toggle-code`.

## Stored Value

The field stores the content as an HTML string sanitized with `wp_kses_post()` on save.

## Example Usage

### Basic Content Editor

	array(
		'type'        => 'richtext',
		'id'          => 'product_description',
		'label'       => 'Product Description',
		'description' => 'Add a detailed product description with formatting.',
		'height'      => 300,
	)

### Minimal Toolbar

	array(
		'type'    => 'richtext',
		'id'      => 'intro',
		'label'   => 'Intro',
		'toolbar' => 'minimal',
	)

### Explicit Toolbar

	array(
		'type'    => 'richtext',
		'id'      => 'body',
		'label'   => 'Body',
		'toolbar' => array(
			'block:paragraph', 'block:h2', 'block:h3',
			'|',
			'format:bold', 'format:italic',
			'|',
			'list:ul', 'insert:link',
			'|',
			'history:undo', 'history:redo',
			'|',
			'view:toggle-code',
		),
	)

### Using Values in Your Theme

	$body = get_post_meta( get_the_ID(), 'body', true );
	if ( ! empty( $body ) ) {
		echo '<div class="body">';
		echo wp_kses_post( apply_filters( 'the_content', $body ) );
		echo '</div>';
	}

## Field Factory

	$f = new \Wpify\CustomFields\FieldFactory();
	$f->richtext(
		label: 'Content',
		toolbar: 'full',
		height: 300,
	);

## Extensibility

### Register a custom toolbar button (JavaScript)

	import { addFilter } from '@wordpress/hooks';

	addFilter( 'wpifycf_richtext_buttons', 'my-plugin/buttons', ( buttons ) => ( {
		...buttons,
		'my:insert-sig': {
			render: ( { disabled } ) => (
				<button disabled={ disabled } onClick={ /* ... */ }>Sig</button>
			),
		},
	} ) );

Then include `'my:insert-sig'` in your `toolbar` array.

### Override presets

	addFilter( 'wpifycf_richtext_toolbar_presets', 'my-plugin/presets', ( presets ) => ( {
		...presets,
		brand_minimal: [ 'format:bold', 'insert:link' ],
	} ) );

### Curate the special-character set

	addFilter( 'wpifycf_richtext_special_chars', 'my-plugin/chars', ( chars ) => [
		...chars,
		{ char: '½', label: 'One half' },
	] );

## Notes

- The Rich Text field coexists with the [`wysiwyg`](wysiwyg.md) field; choose `richtext` for new fields and keep `wysiwyg` for existing TinyMCE-based fields.
- Content is stored as HTML and sanitized with `wp_kses_post()`.
- The Code view lets you edit the underlying HTML directly; switching back to Visual re-parses the HTML and may normalize it (a non-blocking notice explains any changes).
- The counter defaults to "characters excluding whitespace" — click the counter to toggle "including whitespace".
- For code editing with syntax highlighting of languages other than HTML, use the [`code`](code.md) field type instead.
