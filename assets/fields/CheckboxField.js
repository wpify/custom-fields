import React, { useEffect } from 'react';
import classnames from 'classnames';
import ErrorBoundary from '../components/ErrorBoundary';
import { useNormalizedValue } from '../helpers';

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

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);

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

export default CheckboxField;
