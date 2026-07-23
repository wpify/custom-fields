// Mock for react-phone-number-input (ESM, ships its own CSS). A bare tel input
// is enough for the field to mount and forward value/onChange.
const React = require( 'react' );

const PhoneInputMock = React.forwardRef( function PhoneInputMock( props, ref ) {
	return React.createElement( 'input', {
		ref,
		type: 'tel',
		className: props.className,
		value: props.value || '',
		onChange: ( event ) =>
			typeof props.onChange === 'function' && props.onChange( event.target.value ),
	} );
} );

module.exports = PhoneInputMock;
module.exports.default = PhoneInputMock;
