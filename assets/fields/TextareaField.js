/* eslint-disable react/prop-types */

import React, { useEffect, useState } from 'react';
import classnames from 'classnames';

const TextareaField = (props) => {
	const {
		name,
		id = name,
		value,
		onChange = () => null,
		description,
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
			<textarea
				type={type}
				name={name}
				id={id}
				onChange={handleChange}
				aria-describedby={description && describedBy}
				className={classnames('large-text', className)}
				rows={10}
				cols={50}
				{...custom_attributes}
			>{currentValue}</textarea>
			{description && (
				<p className="description" id={describedBy} dangerouslySetInnerHTML={{ __html: description }} />
			)}
		</React.Fragment>
	);
};

export default TextareaField;
