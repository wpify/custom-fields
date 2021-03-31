import React, { useCallback, useContext, useState } from 'react';
import PT from 'prop-types';
import ScreenContext from '../components/ScreenContext';
import { getItemComponent } from '../helpers';

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

	const handleChange = useCallback((newValue = {}) => {
		const newCurrentValue = {
			...currentValue,
			...newValue,
		};

		setCurrentValue(newCurrentValue);

		if (onChange) {
			onChange({ [id]: newCurrentValue });
		}
	}, [currentValue, onChange, id]);

	return (
		<React.Fragment>
			{group_level === 0 && (
				<input type="hidden" id={id} name={id} value={JSON.stringify(currentValue)}/>
			)}
			<RootWrapper group_level={group_level + 1}>
				{items.map((item) => {
					const Field = getItemComponent(item);

					return (
						<RowWrapper
							key={item.id}
							item={item}
							group_level={group_level + 1}
							htmlId={itemId => id + '_' + itemId}
						>
							<Field
								{...item}
								htmlId={itemId => id + '_' + itemId}
								group_level={group_level + 1}
								onChange={handleChange}
								value={currentValue[item.id]}
							/>
						</RowWrapper>
					);
				})}
			</RootWrapper>
		</React.Fragment>
	);
};

GroupField.renderWrapper = (group_level = 0) => group_level > 0;

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
