/* eslint-disable react/prop-types */

import React, { useState, useCallback } from 'react';

const InputField = (props) => {
	const {
		id,
		value,
		onChange,
		description,
		suffix,
		custom_attributes = {},
		group_level = 0,
		className,
		type,
	} = props;

	const [currentValue, setCurrentValue] = useState(value);

	const handleChange = useCallback((event) => {
		setCurrentValue(event.target.value);

		if (onChange) {
			onChange(event.target.value);
		}
	}, [setCurrentValue, onChange]);

	const describedBy = description ? id + '-description' : null;

	return (
		<React.Fragment>
			<input
				type={type}
				id={id}
				name={group_level === 0 && id}
				value={currentValue}
				onChange={handleChange}
				aria-describedby={describedBy}
				className={className}
				{...custom_attributes}
			/>
			{suffix && ' ' + suffix}
			{description && (
				<p className="description" id={describedBy} dangerouslySetInnerHTML={{ __html: description }} />
			)}
		</React.Fragment>
	);
};

export default InputField;
