// Per-field checkValidity sweep. Every field component that exports a static
// checkValidity is exercised with one representative invalid case (expects at
// least one error) and one valid case (expects no errors). The sweep is driven
// off the live registry, and SAMPLES must cover every validity-bearing type —
// a newly added field with checkValidity but no sample fails the coverage test.
import fieldTypes from '@/fields';

const REQUIRED = { required: true };

// type -> { field, invalid, valid }
// `invalid` must yield >=1 error under `field`; `valid` must yield none.
const SAMPLES = {
	// String-required family.
	text: { field: REQUIRED, invalid: '', valid: 'x' },
	textarea: { field: REQUIRED, invalid: '', valid: 'x' },
	password: { field: REQUIRED, invalid: '', valid: 'x' },
	color: { field: REQUIRED, invalid: '', valid: '#fff' },
	code: { field: REQUIRED, invalid: '', valid: 'x' },
	richtext: { field: REQUIRED, invalid: '', valid: '<p>x</p>' },
	wysiwyg: { field: REQUIRED, invalid: '', valid: '<p>x</p>' },
	select: { field: REQUIRED, invalid: '', valid: 'a' },
	radio: { field: REQUIRED, invalid: '', valid: 'a' },
	month: { field: REQUIRED, invalid: '', valid: '2026-01' },
	week: { field: REQUIRED, invalid: '', valid: '2026-W01' },
	time: { field: REQUIRED, invalid: '', valid: '10:00' },
	url: { field: REQUIRED, invalid: '', valid: 'https://x.co' },
	tel: { field: REQUIRED, invalid: '', valid: '+123456' },
	direct_file: { field: REQUIRED, invalid: '', valid: '/uploads/a.pdf' },
	date: { field: REQUIRED, invalid: '', valid: '2026-01-01' },
	datetime: { field: REQUIRED, invalid: '', valid: '2026-01-01T10:00' },
	email: { field: REQUIRED, invalid: '', valid: 'a@b.co' },

	// Number family.
	number: { field: REQUIRED, invalid: '', valid: 5 },
	range: { field: REQUIRED, invalid: '', valid: 5 },
	post: { field: REQUIRED, invalid: '', valid: 5 },

	// Non-zero integer.
	attachment: { field: REQUIRED, invalid: 0, valid: 5 },
	term: { field: REQUIRED, invalid: 0, valid: 5 },

	// Boolean.
	checkbox: { field: REQUIRED, invalid: false, valid: true },
	toggle: { field: REQUIRED, invalid: false, valid: true },

	// Object-shaped.
	link: { field: REQUIRED, invalid: {}, valid: { url: 'https://x.co' } },
	cloudflare: { field: REQUIRED, invalid: {}, valid: { zone_id: 'z1' } },
	mapycz: { field: REQUIRED, invalid: {}, valid: { latitude: 50, longitude: 14 } },
	date_range: {
		field: REQUIRED,
		invalid: [ null, null ],
		valid: [ '2026-01-01', '2026-02-01' ],
	},

	// Group / repeater.
	group: {
		field: { items: [ { id: 'a', type: 'text', required: true } ] },
		invalid: { a: '' },
		valid: { a: 'x' },
	},
	multi_group: {
		field: { items: [ { id: 'a', type: 'text', required: true } ] },
		invalid: [ { a: '' } ],
		valid: [ { a: 'x' } ],
	},

	// Multi wrappers (checkValidityMultiFieldType).
	multi_text: { field: REQUIRED, invalid: [], valid: [ 'a' ] },
	multi_textarea: { field: REQUIRED, invalid: [], valid: [ 'a' ] },
	multi_number: { field: REQUIRED, invalid: [], valid: [ 5 ] },
	multi_date: { field: REQUIRED, invalid: [], valid: [ '2026-01-01' ] },
	multi_datetime: { field: REQUIRED, invalid: [], valid: [ '2026-01-01T10:00' ] },
	multi_email: { field: REQUIRED, invalid: [], valid: [ 'a@b.co' ] },
	multi_link: { field: REQUIRED, invalid: [], valid: [ { url: 'https://x.co' } ] },
	multi_mapycz: { field: REQUIRED, invalid: [], valid: [ { latitude: 50, longitude: 14 } ] },
	multi_month: { field: REQUIRED, invalid: [], valid: [ '2026-01' ] },
	multi_tel: { field: REQUIRED, invalid: [], valid: [ '+123456' ] },
	multi_time: { field: REQUIRED, invalid: [], valid: [ '10:00' ] },
	multi_url: { field: REQUIRED, invalid: [], valid: [ 'https://x.co' ] },
	multi_week: { field: REQUIRED, invalid: [], valid: [ '2026-W01' ] },
	multi_richtext: { field: REQUIRED, invalid: [], valid: [ '<p>x</p>' ] },
	multi_date_range: {
		field: REQUIRED,
		invalid: [],
		valid: [ [ '2026-01-01', '2026-02-01' ] ],
	},

	// Multi non-zero.
	multi_attachment: { field: REQUIRED, invalid: [], valid: [ 1 ] },
	multi_post: { field: REQUIRED, invalid: [], valid: [ 1 ] },
	multi_term: { field: REQUIRED, invalid: [], valid: [ 1 ] },
	multi_direct_file: { field: REQUIRED, invalid: [], valid: [ 1 ] },

	// Multi string / boolean.
	multi_select: { field: REQUIRED, invalid: [ '' ], valid: [ 'a' ] },
	multi_checkbox: { field: REQUIRED, invalid: {}, valid: { a: true } },
	multi_toggle: { field: REQUIRED, invalid: {}, valid: { a: true } },
};

const typesWithValidity = Object.keys( fieldTypes ).filter(
	( type ) => typeof fieldTypes[ type ].checkValidity === 'function'
);

describe( 'per-field checkValidity coverage', () => {
	it( 'has a sample for every validity-bearing field type', () => {
		const missing = typesWithValidity.filter( ( type ) => ! SAMPLES[ type ] );
		expect( missing ).toEqual( [] );
	} );
} );

describe( 'per-field checkValidity behaviour', () => {
	it.each( typesWithValidity )( '%s flags its invalid sample', ( type ) => {
		const sample = SAMPLES[ type ];
		const errors = fieldTypes[ type ].checkValidity( sample.invalid, sample.field );
		expect( errors.length ).toBeGreaterThan( 0 );
	} );

	it.each( typesWithValidity )( '%s accepts its valid sample', ( type ) => {
		const sample = SAMPLES[ type ];
		const errors = fieldTypes[ type ].checkValidity( sample.valid, sample.field );
		expect( errors ).toEqual( [] );
	} );
} );
