import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { ToggleControl } from '@wordpress/components';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

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

	const value = useMemo(() => {
		if (props.generator) {
			return applyFilters('wcf_generator_' + props.generator, props.value, props);
		}

		return Boolean(props.value);
	}, [props]);

	const [currentValue, setCurrentValue] = useState(value);

	const handleChange = (checked) => {
		if (!disabled) {
			setCurrentValue(checked);
		}
	};

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

ToggleField.propTypes = {
	className: PT.string,
	id: PT.string,
	htmlId: PT.string,
	label: PT.string,
	value: PT.string,
	group_level: PT.number,
	custom_attributes: PT.object,
	onChange: PT.func,
	description: PT.string,
	disabled: PT.bool,
	generator: PT.string,
};

export default ToggleField;
