// Global test setup: jsdom matchers plus the browser/WordPress globals the
// source touches but jsdom doesn't provide.
import '@testing-library/jest-dom';

// The RichText field monkey-patches console.error at import time to suppress a
// dev-only Lexical key warning. That replaces the spy @wordpress/jest-console
// installs, breaking its assertions. Pre-set the field's guard flag so the
// patch is skipped under test and the console spy stays intact.
if ( typeof console !== 'undefined' ) {
	console.__wpifycfRichtextPatched = true;
}

// IntersectionObserver: a no-op stand-in. The lazy-loading gate (visibility.js)
// uses it to decide when a field may fetch remote data; a never-firing observer
// keeps fields un-latched so no accidental network happens during unit tests.
// Individual tests that exercise loading can override this.
class IntersectionObserverMock {
	constructor( callback ) {
		this.callback = callback;
	}
	observe() {}
	unobserve() {}
	disconnect() {}
	takeRecords() {
		return [];
	}
}
global.IntersectionObserver = IntersectionObserverMock;
window.IntersectionObserver = IntersectionObserverMock;

// ResizeObserver: used by the Columns field's container-query logic.
class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;
window.ResizeObserver = ResizeObserverMock;

// matchMedia: some @wordpress/components rely on it.
if ( ! window.matchMedia ) {
	window.matchMedia = ( query ) => ( {
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	} );
}

if ( ! window.scrollTo ) {
	window.scrollTo = () => {};
}

// Minimal WordPress runtime globals. Fields read these lazily (behind the
// visibility gate or user interaction), so shallow stubs are enough to mount.
const mediaAttachment = () => ( {
	fetch: () => Promise.resolve( {} ),
	get: () => undefined,
	attributes: {},
} );

window.wp = window.wp || {};
window.wp.media = window.wp.media || Object.assign(
	function media() {
		return {
			on() {
				return this;
			},
			off() {
				return this;
			},
			open() {},
			state() {
				return { get: () => ( { first: () => ( { toJSON: () => ( {} ) } ), toJSON: () => [] } ) };
			},
		};
	},
	{ attachment: mediaAttachment }
);
window.wp.editor = window.wp.editor || {
	initialize: () => {},
	remove: () => {},
	getContent: () => '',
};

window.wpApiSettings = window.wpApiSettings || {
	root: 'http://localhost/wp-json/',
	nonce: 'test-nonce',
};

// Register a minimal `core` data store. WordPress normally provides it via
// @wordpress/core-data (stubbed out in tests), but usePostTypes() reads
// select('core').getPostTypes() and would throw against an unregistered store.
// Returning an empty list lets that hook fall back to its default.
import { createReduxStore, register } from '@wordpress/data';

try {
	const coreStore = createReduxStore( 'core', {
		reducer: ( state = {} ) => state,
		selectors: {
			getPostTypes: () => [],
			getEntityRecords: () => [],
			getMedia: () => undefined,
		},
	} );
	register( coreStore );
} catch ( error ) {
	// Already registered (stores are global singletons across a worker).
}

// Console strictness.
//
// @wordpress/jest-preset-default installs spies (via @wordpress/jest-console)
// that fail any test whose code calls console.warn/error without an explicit
// assertion. We want that strictness for our own code, but NOT for third-party
// WordPress deprecation notices we don't control (e.g. a @wordpress/components
// control announcing a future style change).
//
// Rather than fight the preset's spy bookkeeping, each test runs with console
// methods swapped for capturing shims: the preset's own spies therefore record
// nothing and never fire, and we do the assertion ourselves — failing the test
// on any captured warn/error that isn't on the benign allowlist. This keeps
// genuine problems (React act warnings, thrown render errors) fatal while
// letting known deprecation noise through.
const BENIGN_CONSOLE = [
	/is deprecated since version/i,
	/__nextHasNoMarginBottom/,
];

const CONSOLE_METHODS = [ 'warn', 'error', 'info', 'log' ];
const savedConsole = {};
let captured = {};
let allowedConsole = [];

// Tests that deliberately exercise a console.warn/error branch can allow the
// expected message so it isn't treated as an unexpected offender.
global.allowConsoleMessage = ( pattern ) => {
	allowedConsole.push( pattern );
};

beforeEach( () => {
	captured = {};
	allowedConsole = [];
	CONSOLE_METHODS.forEach( ( method ) => {
		savedConsole[ method ] = console[ method ];
		captured[ method ] = [];
		console[ method ] = ( ...args ) => {
			captured[ method ].push( args );
		};
	} );
} );

afterEach( () => {
	CONSOLE_METHODS.forEach( ( method ) => {
		if ( savedConsole[ method ] ) {
			console[ method ] = savedConsole[ method ];
		}
	} );

	const offenders = [];
	[ 'error', 'warn' ].forEach( ( method ) => {
		( captured[ method ] || [] ).forEach( ( args ) => {
			const message = args
				.map( ( arg ) => ( typeof arg === 'string' ? arg : String( arg && arg.message ? arg.message : arg ) ) )
				.join( ' ' );
			const isBenign = BENIGN_CONSOLE.some( ( pattern ) => pattern.test( message ) );
			const isAllowed = allowedConsole.some( ( pattern ) => pattern.test( message ) );
			if ( ! isBenign && ! isAllowed ) {
				offenders.push( `console.${ method }: ${ message }` );
			}
		} );
	} );

	if ( offenders.length > 0 ) {
		throw new Error(
			`Unexpected console output during test:\n${ offenders.join( '\n' ) }`
		);
	}
} );
