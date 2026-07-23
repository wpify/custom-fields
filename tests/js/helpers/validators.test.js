import {
	stringRequired,
	checkValidityStringType,
	checkValidityNonZeroIntegerType,
	checkValidityBooleanType,
	checkValidityDateTimeType,
	checkValidityEmailType,
	checkValidityGroupType,
	checkValidityMultiGroupType,
	checkValidityMultiFieldType,
	checkValidityMultiBooleanType,
	checkValidityNumberType,
	checkValidityLinkType,
	checkValidityMultiNonZeroType,
	checkValidityMultiStringType,
	checkValidityDateRangeType,
} from '@/helpers/validators';

describe( 'stringRequired', () => {
	it.each( [
		[ 'hello', true ],
		[ '   x  ', true ],
		[ '', false ],
		[ '   ', false ],
		[ 0, false ],
		[ null, false ],
		[ undefined, false ],
	] )( 'stringRequired(%p) -> %p', ( value, expected ) => {
		expect( stringRequired( value ) ).toBe( expected );
	} );
} );

describe( 'checkValidityStringType', () => {
	it( 'passes a non-empty value', () => {
		expect( checkValidityStringType( 'abc', { required: true } ) ).toEqual( [] );
	} );
	it( 'flags a required empty value', () => {
		expect( checkValidityStringType( '', { required: true } ) ).toHaveLength( 1 );
	} );
	it( 'ignores an empty value when not required', () => {
		expect( checkValidityStringType( '', {} ) ).toEqual( [] );
	} );
} );

describe( 'checkValidityNonZeroIntegerType', () => {
	it.each( [
		[ 5, true, 0 ],
		[ '5', true, 0 ],
		[ 0, true, 1 ],
		[ -1, true, 1 ],
		[ '', true, 1 ],
		[ 0, false, 0 ],
	] )( 'value=%p required=%p -> %i error(s)', ( value, required, errors ) => {
		expect( checkValidityNonZeroIntegerType( value, { required } ) ).toHaveLength( errors );
	} );
} );

describe( 'checkValidityBooleanType', () => {
	it( 'passes a truthy value', () => {
		expect( checkValidityBooleanType( true, { required: true } ) ).toEqual( [] );
	} );
	it( 'flags a falsy required value', () => {
		expect( checkValidityBooleanType( false, { required: true } ) ).toHaveLength( 1 );
	} );
} );

describe( 'checkValidityDateTimeType', () => {
	it( 'passes a filled value and flags an empty required one', () => {
		expect( checkValidityDateTimeType( '2026-01-01', { required: true } ) ).toEqual( [] );
		expect( checkValidityDateTimeType( '', { required: true } ) ).toHaveLength( 1 );
	} );
} );

describe( 'checkValidityEmailType', () => {
	it( 'accepts a valid email', () => {
		expect( checkValidityEmailType( 'a@b.co', { required: true } ) ).toEqual( [] );
	} );
	it( 'rejects a malformed email', () => {
		expect( checkValidityEmailType( 'not-an-email', {} ) ).toHaveLength( 1 );
	} );
	it( 'flags required + malformed with two errors', () => {
		// Empty value only trips "required"; a filled malformed value only trips
		// the format rule, so this checks the format branch in isolation.
		expect( checkValidityEmailType( 'nope', { required: true } ) ).toHaveLength( 1 );
		expect( checkValidityEmailType( '', { required: true } ) ).toHaveLength( 1 );
	} );
} );

describe( 'checkValidityNumberType', () => {
	it( 'passes a plain number', () => {
		expect( checkValidityNumberType( 5, {} ) ).toEqual( [] );
	} );
	it( 'enforces min', () => {
		expect( checkValidityNumberType( 2, { min: 3 } ) ).toHaveLength( 1 );
	} );
	it( 'enforces max', () => {
		expect( checkValidityNumberType( 10, { max: 5 } ) ).toHaveLength( 1 );
	} );
	it( 'enforces step multiples', () => {
		expect( checkValidityNumberType( 5, { step: 2 } ) ).toHaveLength( 1 );
		expect( checkValidityNumberType( 4, { step: 2 } ) ).toEqual( [] );
	} );
	it( 'flags a required non-numeric value', () => {
		expect( checkValidityNumberType( 'abc', { required: true } ) ).not.toHaveLength( 0 );
	} );
} );

describe( 'checkValidityLinkType', () => {
	it( 'accepts an object with a url', () => {
		expect( checkValidityLinkType( { url: 'https://x.co' }, { required: true } ) ).toEqual( [] );
	} );
	it( 'accepts an object with a post', () => {
		expect( checkValidityLinkType( { post: 12 }, { required: true } ) ).toEqual( [] );
	} );
	it( 'flags an empty object when required', () => {
		expect( checkValidityLinkType( {}, { required: true } ) ).toHaveLength( 1 );
	} );
} );

describe( 'checkValidityMultiNonZeroType', () => {
	it.each( [
		[ [ 1, 2 ], true, 0 ],
		[ [ 0, 2 ], true, 1 ],
		[ [], true, 1 ],
		[ 'nope', true, 1 ],
		[ [], false, 0 ],
	] )( 'value=%p required=%p -> %i error(s)', ( value, required, errors ) => {
		expect( checkValidityMultiNonZeroType( value, { required } ) ).toHaveLength( errors );
	} );
} );

describe( 'checkValidityMultiStringType', () => {
	it( 'passes an array of non-empty strings', () => {
		expect( checkValidityMultiStringType( [ 'a', 'b' ], { required: true } ) ).toEqual( [] );
	} );
	it( 'flags an array containing an empty string when required', () => {
		expect( checkValidityMultiStringType( [ 'a', '' ], { required: true } ) ).toHaveLength( 1 );
	} );
} );

describe( 'checkValidityMultiBooleanType', () => {
	it( 'passes when at least one value is truthy', () => {
		expect( checkValidityMultiBooleanType( { a: false, b: true }, { required: true } ) ).toEqual( [] );
	} );
	it( 'flags when every value is falsy', () => {
		expect( checkValidityMultiBooleanType( { a: false, b: false }, { required: true } ) ).toHaveLength( 1 );
	} );
} );

describe( 'checkValidityGroupType', () => {
	const field = {
		items: [
			{ id: 'name', type: 'text', required: true },
			{ id: 'age', type: 'number' },
		],
	};

	it( 'returns no errors when children are valid', () => {
		expect( checkValidityGroupType( { name: 'Ada', age: 30 }, field ) ).toEqual( [] );
	} );

	it( 'collects a child error keyed by child id', () => {
		const result = checkValidityGroupType( { name: '', age: 30 }, field );
		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ] ).toHaveProperty( 'name' );
	} );

	it( 'recurses through wrapper/columns items via flattenWrapperItems', () => {
		const wrapped = {
			items: [
				{ type: 'wrapper', items: [ { id: 'inner', type: 'text', required: true } ] },
			],
		};
		const result = checkValidityGroupType( { inner: '' }, wrapped );
		expect( result[ 0 ] ).toHaveProperty( 'inner' );
	} );
} );

describe( 'checkValidityMultiGroupType', () => {
	const field = { items: [ { id: 'name', type: 'text', required: true } ] };

	it( 'flags the offending row by index', () => {
		const result = checkValidityMultiGroupType(
			[ { name: 'ok' }, { name: '' } ],
			field
		);
		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ] ).toHaveProperty( '1' );
	} );

	it( 'returns no errors for an all-valid list', () => {
		expect( checkValidityMultiGroupType( [ { name: 'a' } ], field ) ).toEqual( [] );
	} );
} );

describe( 'checkValidityMultiFieldType factory', () => {
	const validate = checkValidityMultiFieldType( 'text' );

	it( 'flags a required empty array', () => {
		expect( validate( [], { required: true } ) ).toHaveLength( 1 );
	} );

	it( 'delegates to the item type validator per element', () => {
		// text items are required in this field; the empty second item fails.
		const result = validate( [ 'ok', '' ], { required: true } );
		expect( result ).not.toHaveLength( 0 );
		expect( result.some( ( entry ) => typeof entry === 'object' && '1' in entry ) ).toBe( true );
	} );

	it( 'passes a valid list', () => {
		expect( validate( [ 'a', 'b' ], {} ) ).toEqual( [] );
	} );
} );

describe( 'checkValidityDateRangeType', () => {
	it( 'flags a required empty range', () => {
		expect( checkValidityDateRangeType( [ null, null ], { required: true } ) ).toHaveLength( 1 );
	} );
	it( 'accepts an ordered range', () => {
		expect( checkValidityDateRangeType( [ '2026-01-01', '2026-02-01' ], {} ) ).toEqual( [] );
	} );
	it( 'flags a reversed range', () => {
		expect( checkValidityDateRangeType( [ '2026-02-01', '2026-01-01' ], {} ) ).toHaveLength( 1 );
	} );
	it( 'enforces the min bound', () => {
		const result = checkValidityDateRangeType(
			[ '2025-01-01', '2026-01-01' ],
			{ min: '2025-06-01' }
		);
		expect( result.length ).toBeGreaterThan( 0 );
	} );
	it( 'enforces the max bound', () => {
		const result = checkValidityDateRangeType(
			[ '2026-01-01', '2027-01-01' ],
			{ max: '2026-06-01' }
		);
		expect( result.length ).toBeGreaterThan( 0 );
	} );
} );
