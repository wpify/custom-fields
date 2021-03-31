import React, { useCallback, useState } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import Button from '../components/Button';
import MultiGroupFieldRow from './MultiGroupFieldRow';

const MultiGroupField = (props) => {
	const { group_level = 0, onChange, id, items = [], value = [] } = props;
	const [currentValue, setCurrentValue] = useState(Array.isArray(value) ? value : []);

	const handleChange = useCallback((index) => (changedItem = {}) => {
		const newValue = [...currentValue];
		const previousItem = newValue[index];

		if (changedItem === null) {
			newValue.splice(index, 1);
		} else {
			newValue[index] = { ...previousItem, ...changedItem };
		}

		setCurrentValue(newValue);

		if (onChange) {
			onChange(newValue);
		}
	}, [currentValue, onChange]);

	const handleAdd = useCallback(() => {
		const newValue = [...currentValue];
		newValue.push({});
		setCurrentValue(newValue);
	}, [currentValue]);

	const addEnabled = true;

	return (
		<div>
			{group_level === 0 && (
				<input type="hidden" id={id} name={id} value={JSON.stringify(currentValue)}/>
			)}
			{currentValue.map((itemValue, index) => {
				const key = props.id + '_' + index;

				return (
					<React.Fragment key={key}>
						<MultiGroupFieldRow
							group_level={group_level + 1}
							onChange={handleChange(index)}
							items={items}
							value={itemValue}
							htmlId={itemId => id + '_' + index + '_' + itemId}
						/>
						<hr />
					</React.Fragment>
				);
			})}
			<div className={classnames('buttons')}>
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
