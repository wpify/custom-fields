import React, { useCallback, useContext, useEffect, useState } from 'react';
import PT from 'prop-types';
import ScreenContext from '../components/ScreenContext';
import { getItemComponent } from '../helpers';
import ErrorBoundary from '../components/ErrorBoundary';

const GroupField = (props) => {
	const {
		group_level = 0,
		onChange,
		id,
		items,
		value = {}
	} = props;

	const { RootWrapper, RowWrapper } = useContext(ScreenContext);

	const [currentValue, setCurrentValue] = useState(value);

	const handleChange = useCallback((changedValue = {}) => {
		setCurrentValue({
			...currentValue,
			...changedValue,
		});
	}, [currentValue]);

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [value, currentValue]);

	return (
		<React.Fragment>
			{group_level === 0 && (
				<input type="hidden" id={id} name={id} value={JSON.stringify(currentValue)}/>
			)}
			<ErrorBoundary>
				<RootWrapper group_level={group_level + 1}>
					{items.map((item) => {
						const Field = getItemComponent(item);

						return (
							<ErrorBoundary key={item.id}>
								<RowWrapper
									item={item}
									group_level={group_level + 1}
									htmlId={itemId => id + '_' + itemId}
									withoutWrapper={Field.withoutWrapper && Field.withoutWrapper()}
									withoutLabel={Field.noLabel}
									withoutSection={Field.noSection}
								>
									<ErrorBoundary>
										<Field
											{...item}
											htmlId={itemId => id + '_' + itemId}
											group_level={group_level + 1}
											onChange={value => handleChange({ [item.id]: value })}
											value={currentValue[item.id]}
										/>
									</ErrorBoundary>
								</RowWrapper>
							</ErrorBoundary>
						);
					})}
				</RootWrapper>
			</ErrorBoundary>
		</React.Fragment>
	);
};

GroupField.withoutWrapper = (group_level = 0) => group_level === 0;

GroupField.propTypes = {
	object_type: PT.string,
	items: PT.string,
	wcf: PT.string,
	group_level: PT.number,
	value: PT.any,
	onChange: PT.func,
	id: PT.string,
	name: PT.string,
};

export default GroupField;
