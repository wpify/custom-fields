import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PT, { instanceOf } from 'prop-types';
import ScreenContext from '../components/ScreenContext';
import ErrorBoundary from '../components/ErrorBoundary';
import GroupFieldRow from '../components/GroupFieldRow.js';
import { applyFilters } from '@wordpress/hooks';

const GroupField = (props) => {
	const {
		group_level = 0,
		onChange,
		id,
		items,
		appContext,
	} = props;

	const value = useMemo(() => {
		if (props.generator) {
			return applyFilters('wcf_generator_' + props.generator, props.value || {}, props);
		}

		return props.value || {};
	}, [props]);

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
	items: PT.array,
	wcf: PT.string,
	group_level: PT.number,
	value: PT.any,
	onChange: PT.func,
	id: PT.string,
	name: PT.string,
	appContext: PT.object,
	generator: PT.string,
};

export default GroupField;
