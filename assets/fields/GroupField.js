import React, { useCallback, useState } from 'react';
import PT from 'prop-types';
import RootWrapper from '../components/RootWrapper';
import InnerGroup from '../components/InnerGroup';

const GroupField = (props) => {
	const { group_level = 0, onChange, id, wcf, items, value } = props;
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

	if (group_level > 0) {
		return <InnerGroup {...props} onChange={handleChange} wcf={{ ...wcf, items }} group_level={group_level + 1}/>;
	}

	return (
		<React.Fragment>
			{group_level === 0 && (
				<input type="hidden" id={id} name={id} value={JSON.stringify(currentValue)} />
			)}
			<RootWrapper {...props} onChange={handleChange} wcf={{ ...wcf, items }} group_level={group_level + 1}/>
		</React.Fragment>
	);
};

GroupField.noSection = true;

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
