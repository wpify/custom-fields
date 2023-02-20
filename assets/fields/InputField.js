import React, { useEffect } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import classnames from 'classnames';
import { useNormalizedValue } from '../helpers';

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

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);

	const handleChange = (event) => {
		if (type === 'number') {
			setCurrentValue(parseFloat(event.target.value));
		} else {
			setCurrentValue(event.target.value);
		}
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

export default InputField;
