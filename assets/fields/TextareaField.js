/* eslint-disable react/prop-types */

import React, { useState, useCallback } from 'react';
import classnames from 'classnames';

const TextareaField = (props) => {
	const {
		id,
		value,
		onChange,
		description,
		custom_attributes,
		className,
		group_level = 0,
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
			<textarea
				id={id}
				name={group_level === 0 && id}
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
