import React, { useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';
import { Popover } from '@wordpress/components';
import Button from '../components/Button';
import { invertColor, useNormalizedValue } from '../helpers';
import ErrorBoundary from '../components/ErrorBoundary';
import CloseButton from '../components/CloseButton';

const ColorField = (props) => {
	const {
		id,
		htmlId = id => id,
		onChange,
		description,
		custom_attributes = {},
		className,
		group_level = 0,
		appContext,
	} = props;

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);
	const [showPopover, setShowPopover] = useState(false);

	const handleChange = (color) => {
		if (color.rgb.a < 1) {
			setCurrentValue(`rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`);
		} else {
			setCurrentValue(color.hex);
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
			{group_level === 0 && (
				<input type="hidden" name={appContext.hooks.name(id)} value={currentValue}/>
			)}
			<span>
				<ErrorBoundary>
					<Button
						id={appContext.hooks.id(htmlId(id))}
						style={{
							backgroundColor: currentValue,
							color: invertColor(currentValue, true),
							width: '150px',
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
					{currentValue && (
						<CloseButton className="wcf-color-clear" onClick={() => setCurrentValue('')} />
					)}
				</ErrorBoundary>
			</span>
			{description && (
				<ErrorBoundary>
					<p className="description" id={describedBy} dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
		</React.Fragment>
	);
};

export default ColorField;
