import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { ToggleControl } from '@wordpress/components';

const ToggleField = (props) => {
	const {
		id,
		htmlId = id => id,
		label,
		value,
		group_level = 0,
		custom_attributes = {},
		onChange,
		className,
		description,
		disabled = false,
	} = props;

	const [currentValue, setCurrentValue] = useState(Boolean(value));

	console.log(props);

	const handleChange = (checked) => {
		if (!disabled) {
			setCurrentValue(checked);
		}
	};

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [value, currentValue]);

	const control = (
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
				<p className="description" dangerouslySetInnerHTML={{ __html: description }} />
			)}
		</React.Fragment>
	);
};

ToggleField.propTypes = {
	className: PT.string,
};

export default ToggleField;
