import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import Select from 'react-select';
import ErrorBoundary from './ErrorBoundary';

const SelectControl = ({ className, ...rest }) => {
	return (
		<ErrorBoundary>
			<Select
				className={classnames('wcf-select', className)}
				styles={{
					control: (styles, { isFocused }) => ({
						...styles,
						minHeight: '30px',
						borderColor: isFocused ? '#2271b1 !important' : '#8c8f94',
						boxShadow: isFocused ? '0 0 0 1px #2271b1' : 'none',
						outline: isFocused ? '2px solid transparent' : 'none',
						borderRadius: '3px',
						maxWidth: '25em',
					}),
					valueContainer: styles => ({
						...styles,
						padding: '0 8px',
					}),
				}}
				{...rest}
			/>
		</ErrorBoundary>
	);
};

SelectControl.propTypes = {
	id: PT.string,
	onChange: PT.func,
	onInputChange: PT.func,
	options: PT.array,
};

export default SelectControl;
