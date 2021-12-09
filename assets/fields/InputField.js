import React, { useEffect, useState, useMemo } from 'react';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';
import classnames from 'classnames';

// eslint-disable-next-line react/display-name
const InputField = React.forwardRef((props, ref) => {
	const {
		id,
		htmlId = id => id,
		onChange,
		description,
		suffix,
		custom_attributes = {},
		group_level = 0,
		className,
		type,
	} = props;

	const value = useMemo(() => {
		if (props.generator) {
			return applyFilters('wcf_generator_' + props.generator, props.value, props);
		}

		return props.value;
	}, [props]);

	const [currentValue, setCurrentValue] = useState(value);

	const handleChange = (event) => {
		setCurrentValue(event.target.value);
	};

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [onChange, value, currentValue]);

	const describedBy = description ? id + '-description' : null;

	return (
		<React.Fragment>
			<input
				type={type}
				id={htmlId(id)}
				name={group_level === 0 ? id : null}
				value={currentValue}
				onChange={handleChange}
				aria-describedby={describedBy}
				className={classnames(className, 'components-text-control__input')}
				ref={ref}
				{...custom_attributes}
			/>
			{suffix && ' ' + suffix}
			{description && (
				<ErrorBoundary>
					<p className="description" id={describedBy} dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
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
	custom_attributes: PT.oneOfType([PT.object, PT.array]),
	group_level: PT.number,
	className: PT.string,
	type: PT.oneOf(['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'tel', 'text', 'time', 'url', 'week', 'hidden']),
	generator: PT.string,
};

export default InputField;
