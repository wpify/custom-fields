// Mock for react-leaflet / @react-leaflet/core. Components (MapContainer,
// Marker, TileLayer, ...) render their children (or nothing); hooks (useMap,
// useMapEvents, ...) return inert values. Real map rendering is an E2E concern.
const React = require( 'react' );

const Passthrough = function ReactLeafletMock( props ) {
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
				return Passthrough;
			}
			if ( typeof prop === 'string' && /^use[A-Z]/.test( prop ) ) {
				return () => ( {} );
			}
			return Passthrough;
		},
	}
);
