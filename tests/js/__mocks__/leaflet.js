// Mock for the `leaflet` default export (`L`). Leaflet manipulates real DOM
// geometry that jsdom can't provide; the map field's behaviour is an E2E
// concern. Every access returns a chainable callable/constructable stand-in so
// module-level calls like `L.icon(...)` or `L.Control.extend(...)` are inert.
function makeChainable() {
	const target = function () {};

	return new Proxy( target, {
		get( t, prop ) {
			if ( prop === '__esModule' ) {
				return true;
			}
			if ( prop === 'default' ) {
				return module.exports;
			}
			if ( prop === Symbol.toPrimitive || prop === Symbol.iterator ) {
				return undefined;
			}
			return makeChainable();
		},
		apply() {
			return makeChainable();
		},
		construct() {
			return makeChainable();
		},
	} );
}

module.exports = makeChainable();
