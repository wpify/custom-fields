/* eslint-disable react/prop-types */

import React, { useEffect, useState } from 'react';

const InputField = (props) => {
	const {
		name,
		id = name,
		value,
		onChange = () => null,
		description,
		suffix,
		custom_attributes,
		className,
		type,
	} = props;

	const [currentValue, setCurrentValue] = useState(value);

	useEffect(() => {
		onChange(currentValue);
	}, [currentValue]);

	const handleChange = (event) => setCurrentValue(event.target.value);

	const describedBy = description ? id + '-description' : null;

	return (
		<React.Fragment>
			<input
				type={type}
				name={name}
				id={id}
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
