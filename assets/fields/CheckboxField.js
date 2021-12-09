import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

// eslint-disable-next-line react/display-name
const CheckboxField = React.forwardRef((props, ref) => {
	const {
		id,
		htmlId = id => id,
		label,
		group_level = 0,
		custom_attributes = {},
		onChange,
		className
	} = props;

	const value = useMemo(() => {
		if (props.generator) {
			return applyFilters('wcf_generator_' + props.generator, props.value, props);
		}

		return Boolean(props.value);
	}, [props]);

	const [currentValue, setCurrentValue] = useState(value);

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [onChange, value, currentValue]);

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
				ref={ref}
				{...custom_attributes}
			/>
			<ErrorBoundary>
				<span dangerouslySetInnerHTML={{ __html: label }} />
			</ErrorBoundary>
		</label>
	);
});

CheckboxField.propTypes = {
	className: PT.string,
	id: PT.string,
	htmlId: PT.string,
	label: PT.string,
	value: PT.string,
	group_level: PT.number,
	custom_attributes: PT.object,
	onChange: PT.func,
	generator: PT.string,
};

export default CheckboxField;
