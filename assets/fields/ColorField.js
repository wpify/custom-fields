import React, { useEffect, useState } from 'react';
import PT from 'prop-types';
import { SketchPicker } from 'react-color';
import { Popover } from '@wordpress/components';
import Button from '../components/Button';
import { invertColor } from '../helpers';

const ColorField = (props) => {
	const {
		id,
		htmlId = id => id,
		value,
		onChange,
		description,
		custom_attributes = {},
		className,
		group_level = 0,
	} = props;

	const [currentValue, setCurrentValue] = useState(value);
	const [showPopover, setShowPopover] = useState(false);

	const handleChange = (color) => {
		setCurrentValue(color.hex);
	};

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [value, currentValue]);

	const describedBy = description ? id + '-description' : null;

	return (
		<React.Fragment>
			{group_level === 0 && (
				<input type="hidden" name={id} value={currentValue}/>
			)}
			<span>
				<Button
					id={htmlId(id)}
					style={{
						backgroundColor: currentValue,
						color: invertColor(currentValue, true),
						width: '80px',
						height: '20px',
						justifyContent: 'center',
						border: '3px solid #c0c0c0',
						padding: '2px 4px',
						lineHeight: 1,
					}}
					className={className}
					onClick={() => setShowPopover(true)}
					{...custom_attributes}
				>{currentValue}</Button>
				{showPopover && (
					<Popover onClose={() => setShowPopover(false)}>
						<SketchPicker
							color={currentValue}
							onChangeComplete={color => handleChange(color)}
						/>
					</Popover>
				)}
			</span>
			{description && (
				<p className="description" id={describedBy} dangerouslySetInnerHTML={{ __html: description }}/>
			)}
		</React.Fragment>
	);
};

ColorField.propTypes = {
	className: PT.string,
};

export default ColorField;
