import React, { useEffect, useCallback } from 'react';
import classnames from 'classnames';
import { ToggleControl } from '@wordpress/components';
import ErrorBoundary from '../components/ErrorBoundary';
import { useNormalizedValue } from '../helpers';

const ToggleField = (props) => {
	const {
		id,
		htmlId = id => id,
		label,
		group_level = 0,
		custom_attributes = {},
		onChange,
		className,
		description,
		disabled = false,
	} = props;

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);

	const handleChange = useCallback((checked) => {
		if (!disabled) {
			setCurrentValue(checked);
		}
	}, [disabled, setCurrentValue]);

	useEffect(() => {
		if (onChange) {
			onChange(currentValue);
		}
	}, [onChange, currentValue]);

	const control = (
		<ErrorBoundary>
			<ToggleControl
				id={htmlId(id)}
				checked={currentValue}
				name={group_level === 0 && id}
				onChange={handleChange}
				label={<span dangerouslySetInnerHTML={{ __html: label }}/>}
				className={classnames(className)}
				disabled={disabled}
				{...custom_attributes}
			/>
		</ErrorBoundary>
	);

	return (
		<React.Fragment>
			{group_level === 0 && (
				<input type="hidden" name={id} value={currentValue ? 1 : 0}/>
			)}
			{disabled ? (
				<div className="wcf-toggle-disabled">
					{control}
				</div>
			) : control}
			{description && (
				<ErrorBoundary>
					<p className="description" dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
		</React.Fragment>
	);
};

export default ToggleField;
