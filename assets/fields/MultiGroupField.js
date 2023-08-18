import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import Button from '../components/Button';
import MultiGroupFieldRow from './MultiGroupFieldRow';
import SortableControl from '../components/SortableControl';
import { clone, useNormalizedValue } from '../helpers';
import { v4 as uuid } from 'uuid';
import ErrorBoundary from '../components/ErrorBoundary';

const removeKeys = (values = []) => {
	return clone(Array.isArray(values) ? values : []).map(value => {
		delete value.__key;

		return value;
	});
};

const MultiGroupField = (props) => {
	const {
		group_level = 0,
		onChange,
		id,
		description,
		items = [],
		className,
		appContext,
		buttons = {},
		disable_buttons = [],
		min = 0,
		max = 0,
		group_title,
	} = props;

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);

	const [disabledButtons, setDisabledButtons] = useState(disable_buttons);

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

	const handleDuplicate = (index) => (currentItem = {}) => {
		const newValue = [...currentValue];
		const duplicated = clone(currentItem);
		duplicated.__key = uuid();

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			if (item.generator?.length > 0) {
				delete duplicated[item.id];
			}
		}

		newValue.splice(index, 0, duplicated);
		setCurrentValue(newValue);
	}

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

	useEffect(() => {
		if (currentValue.length < min && min > 0) {
			for (let i = currentValue.length; i <= min; i++) {
				handleAdd();
			}
		}

		if (min > 0 && max >= min || min === 0 && max > 0) {
			if (currentValue.length < max) {
				setDisabledButtons(disabledButtons.filter(c => c !== 'add' && c !== 'duplicate'));
			} else if (currentValue.length >= max && !disabledButtons.find(c => c === 'add' || c === 'duplicate')) {
				setDisabledButtons([...disabledButtons, 'add', 'duplicate']);
			}
		}
	}, [currentValue, min, max]);

	const keys = currentValue.map(v => v.__key);
	const setKeys = (keys) => {
		if (JSON.stringify(currentValue.map(v => v.__key)) !== JSON.stringify(keys)) {
			setCurrentValue(keys.map(k => currentValue.find(v => v.__key === k)).filter(Boolean));
		}
	};

	return (
		<div className={classnames('wcf-multi-group', className, props?.class)}>
			{group_level === 0 && (
				<input type="hidden" id={appContext.hooks.id(id)} name={appContext.hooks.name(id)} value={JSON.stringify(removeKeys(currentValue))} />
			)}
			{description && (
				<p>{description}</p>
			)}
			<ErrorBoundary>
				<SortableControl
					className="wcf-multi-group__items"
					items={keys}
					setItems={setKeys}
					allowSort={!disabledButtons.includes('move')}
					renderItem={(key, index) => (
						<ErrorBoundary key={key}>
							<MultiGroupFieldRow
								buttons={buttons}
								group_level={group_level + 1}
								onChange={handleChange(index)}
								onDuplicate={handleDuplicate(index)}
								items={items}
								value={currentValue.find(v => v.__key === key)}
								htmlId={itemId => id + '_' + index + '_' + itemId}
								index={index}
								length={currentValue.length}
								collapsed={key !== opened}
								toggleCollapsed={() => setOpened(key === opened ? null : key)}
								appContext={appContext}
								disabled_buttons={disabledButtons}
								group_title={group_title}
							/>
						</ErrorBoundary>
					)}
				/>
			</ErrorBoundary>
			<div className={classnames('wcf-multi-group__buttons')}>
				{!disabledButtons.includes('add') && (
					<Button className={classnames('button-secondary')} onClick={handleAdd}>
						{buttons.add || __('Add', 'wpify-custom-fields')}
					</Button>
				)}
			</div>
		</div>
	);
};

export default MultiGroupField;
