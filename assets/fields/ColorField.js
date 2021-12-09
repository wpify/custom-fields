import React, { useEffect, useMemo, useState } from 'react';
import PT from 'prop-types';
import { SketchPicker } from 'react-color';
import { Popover } from '@wordpress/components';
import Button from '../components/Button';
import { invertColor } from '../helpers';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const ColorField = (props) => {
	const {
		id,
		htmlId = id => id,
		onChange,
		description,
		custom_attributes = {},
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
	const [showPopover, setShowPopover] = useState(false);

	const handleChange = (color) => {
		setCurrentValue(color.hex);
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
				<input type="hidden" name={id} value={currentValue}/>
			)}
			<span>
				<ErrorBoundary>
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

ColorField.propTypes = {
	className: PT.string,
	id: PT.string,
	htmlId: PT.string,
	value: PT.string,
	onChange: PT.func,
	description: PT.string,
	custom_attributes: PT.object,
	group_level: PT.number,
	generator: PT.string,
};

export default ColorField;
