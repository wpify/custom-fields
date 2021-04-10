import React, { useEffect, useState } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import Button from '../components/Button';
import MultiGroupFieldRow from './MultiGroupFieldRow';
import SortableControl from '../components/SortableControl';
import { clone } from '../helpers';
import { v4 as uuid } from 'uuid';

const prepareValues = (values = []) => {
	if (Array.isArray(values)) {
		return clone(values).map((value) => {
			value.__key = uuid();
			return value;
		});
	}

	return [];
};

const removeKeys = (values = []) => clone(values).map(value => {
	delete value.__key;
	return value;
});

const MultiGroupField = (props) => {
	const { group_level = 0, onChange, id, items = [], value = [], className } = props;
	const [currentValue, setCurrentValue] = useState(prepareValues(value));
	const [opened, setOpened] = useState(null);

	const handleChange = (index) => (changedItem = {}) => {
		const newValue = [...currentValue];

		if (changedItem === null) {
			newValue.splice(index, 1);
		} else {
			newValue[index] = changedItem;
		}

		setCurrentValue(newValue);
	};

	const handleAdd = () => {
		const newValue = [...currentValue];
		newValue.push({ __key: uuid() });
		setCurrentValue(newValue);
	};

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(removeKeys(currentValue))) {
			onChange(removeKeys(currentValue));
		}
	}, [value, currentValue]);

	const addEnabled = true;

	return (
		<div className={classnames('wcf-multi-group', className)}>
			{group_level === 0 && (
				<input type="hidden" id={id} name={id} value={JSON.stringify(currentValue)}/>
			)}
			<SortableControl
				list={currentValue}
				setList={setCurrentValue}
			>
				{currentValue.map((itemValue, index) => {
					return (
						<MultiGroupFieldRow
							key={itemValue.__key}
							group_level={group_level + 1}
							onChange={handleChange(index)}
							items={items}
							value={itemValue}
							htmlId={itemId => id + '_' + index + '_' + itemId}
							index={index}
							length={currentValue.length}
							collapsed={itemValue.__key !== opened}
							toggleCollapsed={() => setOpened(itemValue.__key === opened ? null : itemValue.__key)}
						/>
					);
				})}
			</SortableControl>
			<div className={classnames('wcf-multi-group__buttons')}>
				{addEnabled && (
					<Button className={classnames('button-secondary')} onClick={handleAdd}>
						{__('Add', 'wpify-custom-fields')}
					</Button>
				)}
			</div>
		</div>
	);
};

MultiGroupField.propTypes = {
	object_type: PT.string,
	items: PT.string,
	wcf: PT.string,
	group_level: PT.number,
	value: PT.any,
	onChange: PT.func,
	id: PT.string,
	name: PT.string,
	className: PT.string,
};

export default MultiGroupField;
