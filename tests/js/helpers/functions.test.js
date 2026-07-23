import {
	evaluateConditions,
	getValueByPath,
	interpolateFieldValues,
	flattenWrapperItems,
	normalizeUrl,
	stripHtml,
} from '@/helpers/functions';

const cond = ( field, condition, value ) => ( { field, condition, value } );

describe( 'evaluateConditions — operators', () => {
	const data = {
		str: 'hello',
		num: 5,
		list: [ 'a', 'b', 'c' ],
		empty: '',
		flag: true,
	};
	// currentPath is only consulted for relative (#) refs; a non-relative field
	// ref ignores it, so any value works here.
	const path = 'x';

	it.each( [
		[ cond( 'num', '==', 5 ), true ],
		[ cond( 'num', '==', '5' ), true ], // loose equality
		[ cond( 'num', '!=', 6 ), true ],
		[ cond( 'num', '>', 4 ), true ],
		[ cond( 'num', '>', 5 ), false ],
		[ cond( 'num', '>=', 5 ), true ],
		[ cond( 'num', '<', 6 ), true ],
		[ cond( 'num', '<', 5 ), false ],
		[ cond( 'num', 'between', [ 1, 10 ] ), true ],
		[ cond( 'num', 'between', [ 6, 10 ] ), false ],
		[ cond( 'str', 'contains', 'ell' ), true ],
		[ cond( 'str', 'contains', 'zzz' ), false ],
		[ cond( 'str', 'not_contains', 'zzz' ), true ],
		[ cond( 'list', 'contains', 'b' ), true ],
		[ cond( 'str', 'in', [ 'hello', 'world' ] ), true ],
		[ cond( 'str', 'in', [ 'world' ] ), false ],
		[ cond( 'str', 'not_in', [ 'world' ] ), true ],
		[ cond( 'empty', 'empty', null ), true ],
		[ cond( 'str', 'empty', null ), false ],
		[ cond( 'str', 'not_empty', null ), true ],
		[ cond( 'empty', 'not_empty', null ), false ],
	] )( '%o -> %p', ( condition, expected ) => {
		expect( evaluateConditions( data, [ condition ], path ) ).toBe( expected );
	} );

	it( 'treats <= like < at the boundary (known quirk in evaluateCondition)', () => {
		// The '<=' branch returns `value < expected`; a dedicated test locks the
		// current behaviour so an intentional fix is a visible, deliberate change.
		expect( evaluateConditions( data, [ cond( 'num', '<=', 5 ) ], path ) ).toBe( false );
		expect( evaluateConditions( data, [ cond( 'num', '<=', 6 ) ], path ) ).toBe( true );
	} );
} );

describe( 'evaluateConditions — combinators and nesting', () => {
	const data = { a: 1, b: 2 };

	it( 'defaults to AND between conditions', () => {
		expect(
			evaluateConditions( data, [ cond( 'a', '==', 1 ), cond( 'b', '==', 2 ) ], 'x' )
		).toBe( true );
		expect(
			evaluateConditions( data, [ cond( 'a', '==', 1 ), cond( 'b', '==', 99 ) ], 'x' )
		).toBe( false );
	} );

	it( 'honours an explicit OR combinator', () => {
		expect(
			evaluateConditions(
				data,
				[ cond( 'a', '==', 99 ), 'or', cond( 'b', '==', 2 ) ],
				'x'
			)
		).toBe( true );
	} );

	it( 'evaluates nested groups', () => {
		const conditions = [
			cond( 'a', '==', 1 ),
			'and',
			[ cond( 'b', '==', 99 ), 'or', cond( 'b', '==', 2 ) ],
		];
		expect( evaluateConditions( data, conditions, 'x' ) ).toBe( true );
	} );

	it( 'returns true for a non-array conditions value (and logs)', () => {
		allowConsoleMessage( /Conditions must be an array/ );
		expect( evaluateConditions( data, 'nope', 'x' ) ).toBe( true );
	} );
} );

describe( 'getValueByPath', () => {
	it( 'resolves dot notation', () => {
		expect( getValueByPath( { a: { b: { c: 7 } } }, 'a.b.c' ) ).toBe( 7 );
	} );

	it( 'resolves array index notation', () => {
		expect( getValueByPath( { a: [ { b: 2 }, { b: 3 } ] }, 'a[1].b' ) ).toBe( 3 );
	} );

	it( 'returns undefined for a missing path', () => {
		expect( getValueByPath( { a: 1 }, 'a.b.c' ) ).toBeUndefined();
	} );

	it( 'resolves a single relative (#) ref against the current path', () => {
		// currentPath "parent.self" with "#.sibling" climbs one segment.
		expect(
			getValueByPath( { parent: { sibling: 5 } }, '#.sibling', 'parent.self' )
		).toBe( 5 );
	} );

	it( 'resolves a double relative (##) ref two levels up', () => {
		expect(
			getValueByPath( { a: { uncle: 9 } }, '##.uncle', 'a.b.c' )
		).toBe( 9 );
	} );

	it( 'logs and does not climb when the ref exceeds the path depth', () => {
		allowConsoleMessage( /Invalid path/ );
		// hashCount >= parts.length: resolution is left as-is.
		expect( getValueByPath( { x: 1 }, '##.x', 'a' ) ).toBeUndefined();
	} );
} );

describe( 'interpolateFieldValues', () => {
	const getValue = ( pathName ) => ( { title: 'Hello', name: 'World' }[ pathName ] );

	it( 'replaces a {{placeholder}} with the resolved value', () => {
		expect(
			interpolateFieldValues( { label: 'Hi {{name}}' }, getValue )
		).toEqual( { label: 'Hi World' } );
	} );

	it( 'leaves non-placeholder strings untouched', () => {
		expect(
			interpolateFieldValues( { label: 'plain' }, getValue )
		).toEqual( { label: 'plain' } );
	} );

	it( 'replaces a missing value with an empty string', () => {
		expect(
			interpolateFieldValues( { label: '{{unknown}}' }, getValue )
		).toEqual( { label: '' } );
	} );

	it( 'passes through non-object params', () => {
		expect( interpolateFieldValues( null, getValue ) ).toBeNull();
	} );
} );

describe( 'flattenWrapperItems', () => {
	it( 'flattens wrapper and columns containers recursively', () => {
		const items = [
			{ id: 'a', type: 'text' },
			{
				type: 'wrapper',
				items: [
					{ id: 'b', type: 'text' },
					{ type: 'columns', items: [ { id: 'c', type: 'text' } ] },
				],
			},
		];
		expect( flattenWrapperItems( items ).map( ( i ) => i.id ) ).toEqual( [ 'a', 'b', 'c' ] );
	} );

	it( 'returns [] for a non-array', () => {
		expect( flattenWrapperItems( undefined ) ).toEqual( [] );
	} );
} );

describe( 'normalizeUrl', () => {
	it.each( [
		[ 'example.com', 'https://example.com/' ],
		[ 'http://example.com', 'http://example.com/' ],
		[ '//example.com', 'https://example.com/' ],
		[ '#anchor', '#anchor' ],
		[ '?q=1', '?q=1' ],
	] )( 'normalizeUrl(%p) -> %p', ( input, expected ) => {
		expect( normalizeUrl( input ) ).toBe( expected );
	} );

	it( 'blocks javascript: and data: schemes', () => {
		expect( normalizeUrl( 'javascript:alert(1)' ) ).toBe( '' );
		expect( normalizeUrl( 'data:text/html,x' ) ).toBe( '' );
	} );

	it( 'preserves and cleans a mailto: address', () => {
		expect( normalizeUrl( 'mailto:a@b.co' ) ).toBe( 'mailto:a@b.co' );
	} );
} );

describe( 'stripHtml', () => {
	it( 'returns the text content of HTML', () => {
		expect( stripHtml( '<p>Hello <strong>world</strong></p>' ) ).toBe( 'Hello world' );
	} );

	it( 'returns an empty string for empty input', () => {
		expect( stripHtml( '' ) ).toBe( '' );
	} );
} );
