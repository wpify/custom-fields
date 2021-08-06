import React, { useCallback, useContext, useEffect, useState } from 'react';
import PT from 'prop-types';
import ScreenContext from '../components/ScreenContext';
import ErrorBoundary from '../components/ErrorBoundary';
import GroupFieldRow from './GroupFieldRow';

const GroupField = (props) => {
	const {
		group_level = 0,
		onChange,
		id,
		items,
		value = {},
		appContext,
	} = props;

	const { RootWrapper } = useContext(ScreenContext);

	const [currentValue, setCurrentValue] = useState(value);

	const handleChange = useCallback((changedValue = {}) => {
		const newValue = {
			...currentValue,
			...changedValue,
		};

		if (JSON.stringify(newValue) !== JSON.stringify(currentValue)) {
			setCurrentValue(newValue);
		}
	}, [currentValue]);

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [value, currentValue, onChange]);

	return (
		<React.Fragment>
			{group_level === 0 && (
				<input type="hidden" id={id} name={id} value={JSON.stringify(currentValue)}/>
			)}
			<ErrorBoundary>
				<RootWrapper group_level={group_level + 1}>
					{items.map((item) => (
						<GroupFieldRow
							key={item.id}
							item={item}
							group_level={group_level}
							appContext={appContext}
							onChange={handleChange}
							value={value[item.id]}
						/>
					))}
				</RootWrapper>
			</ErrorBoundary>
		</React.Fragment>
	);
};

GroupField.propTypes = {
	object_type: PT.string,
	items: PT.string,
	wcf: PT.string,
	group_level: PT.number,
	value: PT.any,
	onChange: PT.func,
	id: PT.string,
	name: PT.string,
	appContext: PT.object,
};

export default GroupField;
