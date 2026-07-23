// Mock for @wordpress/block-editor. The real package pulls in a large,
// partly-ESM dependency tree (block canvas, inserter, parsel-js, ...) that is
// irrelevant to unit tests. Components render their children; block-props hooks
// return an empty props object. Block editing behaviour is an E2E concern.
const React = require( 'react' );

const Passthrough = function BlockEditorMock( props ) {
	return props && props.children != null ? props.children : null;
};

function useBlockPropsMock() {
	return {};
}
useBlockPropsMock.save = () => ( {} );

module.exports = new Proxy(
	{ __esModule: true },
	{
		get( target, prop ) {
			if ( prop === '__esModule' ) {
				return true;
			}
			if ( prop === 'default' ) {
				return Passthrough;
			}
			if ( prop === 'useBlockProps' ) {
				return useBlockPropsMock;
			}
			if ( typeof prop === 'string' && /^use[A-Z]/.test( prop ) ) {
				return () => ( {} );
			}
			return Passthrough;
		},
	}
);
