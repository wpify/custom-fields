import React from 'react';
import PT from 'prop-types';
import Select from 'react-select';

const SelectControl = ({ id, onChange, value, onInputChange, options, ...rest }) => {
  return (
		<Select
			id={id}
			onChange={onChange}
			value={value}
			onInputChange={onInputChange}
			options={options}
			className="wcf-select"
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
  );
};

SelectControl.propTypes = {
  id: PT.string,
	onChange: PT.func,
	onInputChange: PT.func,
	options: PT.array,
};

export default SelectControl;
