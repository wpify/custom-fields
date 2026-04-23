# Multi Rich Text Field Type

A repeater variant of the [`richtext`](richtext.md) field — an ordered list of rich text editors that can be added, removed, and reordered.

## Field Type: `multi_richtext`

	array(
		'type'  => 'multi_richtext',
		'id'    => 'sections',
		'label' => 'Sections',
	)

## Properties

For Default Field Properties and multi-field properties (`min`, `max`, etc.), see [Field Types Definition](../field-types.md).

All properties of the [`richtext`](richtext.md) field apply to each item, including `toolbar`, `height`, `word_count`, and `default_view`.

## Stored Value

An ordered array of HTML strings.

## Example Usage

	array(
		'type'    => 'multi_richtext',
		'id'      => 'sections',
		'label'   => 'Sections',
		'toolbar' => 'basic',
		'min'     => 1,
		'max'     => 10,
	)

### Reading Values in Your Theme

	$sections = (array) get_post_meta( get_the_ID(), 'sections', true );
	foreach ( $sections as $html ) {
		echo '<section>';
		echo wp_kses_post( apply_filters( 'the_content', $html ) );
		echo '</section>';
	}

## Field Factory

	$f->multi_richtext(
		label: 'Sections',
		toolbar: 'basic',
		min: 1,
		max: 10,
	);

## Notes

- Each item is an independent rich text editor; collapsing/expanding items works the same as other multi-fields.
- Word counters are per-item.
