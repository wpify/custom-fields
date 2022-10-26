import React, { useCallback, useContext, useEffect } from 'react';
import ScreenContext from '../components/ScreenContext';
import ErrorBoundary from '../components/ErrorBoundary';
import GroupFieldRow from '../components/GroupFieldRow.js';
import { useNormalizedValue } from '../helpers';

const GroupField = (props) => {
	const {
		group_level = 0,
		onChange,
		id,
		items,
		appContext,
	} = props;

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);

	const { RootWrapper, RowWrapper } = useContext(ScreenContext);

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
			<ErrorBoundary>
				<RootWrapper group_level={group_level + 1}>
					{group_level === 0 && (
						<RowWrapper item={{ title: 'hidden', type: 'hidden' }} withoutLabel={true} style={{ display: 'none' }}>
							<input type="hidden" id={id} name={id} value={JSON.stringify(currentValue)}/>
						</RowWrapper>
					)}
					{items.map((item) => (
						<GroupFieldRow
							key={item.id}
							item={item}
							group_level={group_level}
							appContext={appContext}
							onChange={handleChange}
							value={value && value[item.id]}
						/>
					))}
				</RootWrapper>
			</ErrorBoundary>
		</React.Fragment>
	);
};

export default GroupField;
