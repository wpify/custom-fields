import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';

const CheckboxField = (props) => {
	const {
		id,
		htmlId = id => id,
		label,
		value,
		group_level = 0,
		custom_attributes = {},
		onChange,
		className
	} = props;

	const [currentValue, setCurrentValue] = useState(Boolean(value));

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [value, currentValue]);

	const handleChange = (event) => {
		setCurrentValue(event.target.checked);
	};

	return (
		<label htmlFor={htmlId(id)} className={classnames(className)}>
			{group_level === 0 && (
				<input type="hidden" name={id} value={currentValue ? 1 : 0}/>
			)}
			<input
				type="checkbox"
				checked={currentValue}
				id={htmlId(id)}
				onChange={handleChange}
				{...custom_attributes}
			/>
			{label}
		</label>
	);
};

CheckboxField.propTypes = {
	className: PT.string,
};

export default CheckboxField;
