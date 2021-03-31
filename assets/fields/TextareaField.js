import React, { useState, useCallback } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

const TextareaField = (props) => {
	const {
		id,
		htmlId = id => id,
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
			onChange({ [id]: event.target.value });
		}
	}, [id, setCurrentValue, onChange]);

	const describedBy = description ? id + '-description' : null;

	return (
		<React.Fragment>
			<textarea
				id={htmlId(id)}
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


TextareaField.propTypes = {
	id: PT.string,
	htmlId: PT.func,
	value: PT.string,
	onChange: PT.func,
	description: PT.oneOfType([PT.string, PT.element]),
	suffix: PT.oneOfType([PT.string, PT.element]),
	custom_attributes: PT.object,
	group_level: PT.number,
	className: PT.string,
	type: PT.oneOf(['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'tel', 'text', 'time', 'url', 'week']),
};

export default TextareaField;
