import React, { useEffect, useState } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import Button from '../components/Button';
import MultiGroupFieldRow from './MultiGroupFieldRow';
import { ReactSortable } from 'react-sortablejs';

const prepareValues = (values = []) => {
	if (Array.isArray(values)) {
		return values.map((value, index) => {
			value.__key = index;
			return value;
		});
	}

	return [];
};

const getNextKey = (values = []) => values.reduce((p, c) => Math.max(p.__key, c.__key), 0) + 1;

const removeKeys = (values = []) => values.map(value => {
	delete value.__key;
	return value;
});

const MultiGroupField = (props) => {
	const { group_level = 0, onChange, id, items = [], value = [], className } = props;
	const [currentValue, setCurrentValue] = useState(prepareValues(value));

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
		newValue.push({ __key: getNextKey(currentValue) });
		setCurrentValue(newValue);
	};

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(removeKeys(currentValue))) {
			onChange(currentValue);
		}
	}, [value, currentValue]);

	const addEnabled = true;

	return (
		<div className={classnames('wcf-multi-group', className)}>
			{group_level === 0 && (
				<input type="hidden" id={id} name={id} value={JSON.stringify(currentValue)}/>
			)}
			<ReactSortable
				list={currentValue}
				setList={setCurrentValue}
				animation={150}
				handle=".wcf-multi-group-row__button--move"
				ghostClass="wcf-multi-group-row--ghost"
				dragClass="wcf-multi-group-row--drag"
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
						/>
					);
				})}
			</ReactSortable>
			<div className={classnames('wcf-multi-group__buttons')}>
				{addEnabled && (
					<Button className={classnames('button-secondary')} onClick={handleAdd}>
						Add
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
};

export default MultiGroupField;
