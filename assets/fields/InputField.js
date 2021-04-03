import React, { useEffect, useState } from 'react';
import PT from 'prop-types';

const InputField = React.forwardRef((props, ref) => {
	const {
		id,
		htmlId = id => id,
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

	const handleChange = (event) => {
		setCurrentValue(event.target.value);
	};

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [value, currentValue]);

	const describedBy = description ? id + '-description' : null;

	return (
		<React.Fragment>
			<input
				type={type}
				id={htmlId(id)}
				name={group_level === 0 && id}
				value={currentValue}
				onChange={handleChange}
				aria-describedby={describedBy}
				className={className}
				ref={ref}
				{...custom_attributes}
			/>
			{suffix && ' ' + suffix}
			{description && (
				<p className="description" id={describedBy} dangerouslySetInnerHTML={{ __html: description }}/>
			)}
		</React.Fragment>
	);
});

InputField.propTypes = {
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

export default InputField;
