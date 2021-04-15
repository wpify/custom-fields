import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { ToggleControl } from '@wordpress/components';
import ErrorBoundary from '../components/ErrorBoundary';

const MultiToggleField = (props) => {
	const {
		id,
		htmlId = id => id,
		value = [],
		group_level = 0,
		custom_attributes = {},
		onChange,
		className,
		description,
		options = [],
	} = props;

	const [currentValue, setCurrentValue] = useState(Array.isArray(value) ? value : []);

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [value, currentValue]);

	const handleChange = id => checked => {
		const value = [...currentValue];
		const index = value.indexOf(id);

		if (checked && index === -1) {
			value.push(id);
		} else if (!checked && index > -1) {
			value.splice(index, 1);
		}

		setCurrentValue(value);
	};

	return (
		<React.Fragment>
			{group_level === 0 && (
				<input type="hidden" name={id} value={JSON.stringify(currentValue)}/>
			)}
			{description && (
				<ErrorBoundary>
					<p className="description" dangerouslySetInnerHTML={{ __html: description }} style={{ marginBottom: '4px' }}/>
				</ErrorBoundary>
			)}
			{Array.isArray(options) && options.map(option => (
				<ErrorBoundary key={id + '_' + option.value}>
					<ToggleControl
						id={htmlId(id + '_' + option.value)}
						checked={currentValue.includes(option.value)}
						onChange={handleChange(option.value)}
						label={<span dangerouslySetInnerHTML={{ __html: option.label }}/>}
						className={classnames(className)}
						disabled={option.disabled}
						{...custom_attributes}
					/>
				</ErrorBoundary>
			))}
		</React.Fragment>
	);
};

MultiToggleField.propTypes = {
	className: PT.string,
};

export default MultiToggleField;
