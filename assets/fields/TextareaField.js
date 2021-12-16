import React, { useEffect, useMemo, useState } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const TextareaField = (props) => {
	const {
		id,
		htmlId = id => id,
		onChange,
		description,
		custom_attributes,
		className,
		group_level = 0,
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
			<textarea
				id={htmlId(id)}
				name={group_level === 0 && id}
				onChange={handleChange}
				aria-describedby={description && describedBy}
				className={classnames('large-text', className)}
				rows={10}
				cols={50}
				value={currentValue}
				{...custom_attributes}
			/>
			{description && (
				<ErrorBoundary>
					<p className="description" id={describedBy} dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
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
	custom_attributes: PT.any,
	group_level: PT.number,
	className: PT.string,
	type: PT.string,
	generator: PT.string,
};

export default TextareaField;
