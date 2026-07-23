// Mock for `lexical` and every `@lexical/*` subpath. The Lexical editor is a
// contentEditable-driven widget whose real behaviour lives in the E2E layer;
// for the jsdom Mount-sweep we only need the RichText field tree to mount.
//
// A single Proxy backs all Lexical imports. Most exports are either command
// tokens, node classes, side-effecting functions, or React components — a
// universal component-like function serves all of those. The two exports that
// are destructured need real shapes and are special-cased.
const React = require( 'react' );

// An editor whose mutating methods are inert: register* return an unsubscribe
// callback, update/read never invoke their callbacks (so the $-prefixed state
// helpers are never actually executed during a mount).
function makeEditorStub() {
	const unsubscribe = () => {};

	return new Proxy(
		{},
		{
			get( target, prop ) {
				switch ( prop ) {
					case 'getEditorState':
						return () => ( { read: () => {}, toJSON: () => ( {} ) } );
					case 'getRootElement':
						return () => null;
					case 'update':
					case 'read':
					case 'setEditable':
					case 'focus':
					case 'blur':
					case 'dispatchCommand':
						return () => {};
					default:
						return () => unsubscribe;
				}
			},
		}
	);
}

// Usable as a React component (renders children or nothing), a no-op function,
// a command token, or an extendable base class (e.g. `extends DecoratorNode`).
const AnyExport = function LexicalMock( props ) {
	return props && props.children != null ? props.children : null;
};

module.exports = new Proxy(
	{ __esModule: true },
	{
		get( target, prop ) {
			if ( prop === '__esModule' ) {
				return true;
			}
			if ( prop === 'default' ) {
				return AnyExport;
			}
			if ( prop === 'useLexicalComposerContext' ) {
				return () => [ makeEditorStub() ];
			}
			if ( prop === 'useLexicalNodeSelection' ) {
				return () => [ false, () => {}, () => {} ];
			}
			if ( prop === 'mergeRegister' ) {
				return () => () => {};
			}
			return AnyExport;
		},
	}
);
