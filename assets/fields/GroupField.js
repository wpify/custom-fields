import React, { useCallback, useContext, useEffect } from 'react';
import ScreenContext from '../components/ScreenContext';
import ErrorBoundary from '../components/ErrorBoundary';
import GroupFieldRow from '../components/GroupFieldRow.js';
import { useNormalizedValue } from '../helpers';
import { applyFilters } from '@wordpress/hooks';
import classnames from 'classnames';

const GroupField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);
	const {
		group_level = 0,
		onChange,
		id,
		items,
		appContext,
		className
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
				<RootWrapper group_level={group_level + 1} className={classnames(props?.class, className)}>
					{group_level === 0 && (
						<RowWrapper item={{ title: 'hidden', type: 'hidden' }} withoutLabel={true} style={{ display: 'none' }}>
							<input type="hidden" id={appContext.hooks.id(id)} name={appContext.hooks.name(id)} value={JSON.stringify(currentValue)} />
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
