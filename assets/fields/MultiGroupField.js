import React, { useEffect, useMemo, useState } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import Button from '../components/Button';
import MultiGroupFieldRow from './MultiGroupFieldRow';
import SortableControl from '../components/SortableControl';
import { clone } from '../helpers';
import { v4 as uuid } from 'uuid';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

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
	delete value.chosen;
	delete value.selected;
	return value;
});

const MultiGroupField = (props) => {
	const { group_level = 0, onChange, id, items = [], className, appContext } = props;
	const value = useMemo(() => {
		if (props.generator) {
			return applyFilters('wcf_generator_' + props.generator, prepareValues(props.value || []), props);
		}

		return prepareValues(props.value || []);
	}, [props]);
	const [currentValue, setCurrentValue] = useState(value);
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
		const __key = uuid();
		newValue.push({ __key });
		setCurrentValue(newValue);
		setOpened(__key);
	};

	useEffect(() => {
		if (onChange && JSON.stringify(removeKeys(value)) !== JSON.stringify(removeKeys(currentValue))) {
			onChange(removeKeys(currentValue));
		}
	}, [onChange, value, currentValue]);

	const addEnabled = true;

	const keys = currentValue.map(v => v.__key);
	const setKeys = (keys) => {
		if (JSON.stringify(currentValue.map(v => v.__key)) !== JSON.stringify(keys)) {
			setCurrentValue(keys.map(k => currentValue.find(v => v.__key === k)).filter(Boolean));
		}
	};

	return (
		<div className={classnames('wcf-multi-group', className)}>
			{group_level === 0 && (
				<input type="hidden" id={id} name={id} value={JSON.stringify(removeKeys(currentValue))}/>
			)}
			<ErrorBoundary>
				<SortableControl
					className="wcf-multi-group__items"
					items={keys}
					setItems={setKeys}
					renderItem={(key, index) => (
						<ErrorBoundary key={key}>
							<MultiGroupFieldRow
								group_level={group_level + 1}
								onChange={handleChange(index)}
								items={items}
								value={currentValue.find(v => v.__key === key)}
								htmlId={itemId => id + '_' + index + '_' + itemId}
								index={index}
								length={currentValue.length}
								collapsed={key !== opened}
								toggleCollapsed={() => setOpened(key === opened ? null : key)}
								appContext={appContext}
							/>
						</ErrorBoundary>
					)}
				/>
			</ErrorBoundary>
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
	items: PT.array,
	appContext: PT.object,
	group_level: PT.number,
	value: PT.any,
	onChange: PT.func,
	id: PT.string,
	name: PT.string,
	className: PT.string,
	generator: PT.string,
};

export default MultiGroupField;
