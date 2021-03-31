import React from 'react';
import classnames from 'classnames';
import InputField from './InputField';
import PT from 'prop-types';

const ColorField = (props) => {
	const { className } = props;

	return (
		<React.Fragment>
			<InputField
				{...props}
				type="color"
				className={classnames('colorpick', className)}
			/>
		</React.Fragment>
	);
};

ColorField.propTypes = {
	className: PT.string,
};

export default ColorField;
