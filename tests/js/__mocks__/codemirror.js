// Mock for @uiw/react-codemirror: a plain textarea stand-in. The real editor
// is a browser-only widget whose behaviour belongs to the E2E layer; here we
// only need the field to mount and to forward value/onChange.
const React = require( 'react' );

const CodeMirrorMock = React.forwardRef( function CodeMirrorMock( props, ref ) {
	return React.createElement( 'textarea', {
		ref,
		'data-testid': 'codemirror',
		className: props.className,
		value: props.value || '',
		readOnly: ! props.onChange,
		onChange: ( event ) =>
			typeof props.onChange === 'function' && props.onChange( event.target.value ),
	} );
} );

module.exports = CodeMirrorMock;
module.exports.default = CodeMirrorMock;
