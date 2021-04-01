import React, { useCallback, useState } from 'react';
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
	} = props;

	const [currentValue, setCurrentValue] = useState(Boolean(value));

	const handleChange = useCallback((checked) => {
		setCurrentValue(checked);

		if (onChange) {
			onChange({ [id]: checked });
		}
	}, [id]);

	return (
		<React.Fragment>
			{group_level === 0 && (
				<input type="hidden" name={id} value={currentValue ? 1 : 0}/>
			)}
			<ToggleControl
				id={htmlId(id)}
				checked={currentValue}
				name={group_level === 0 && id}
				onChange={handleChange}
				label={<span dangerouslySetInnerHTML={{ __html: label }}/>}
				className={classnames(className)}
				{...custom_attributes}
			/>
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
