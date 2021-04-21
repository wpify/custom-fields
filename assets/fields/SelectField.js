import React, { useContext, useEffect, useState } from 'react';
import PT from 'prop-types';
import AppContext from '../components/AppContext';
import SearchableSelectControl from '../components/SearchableSelectControl';
import ErrorBoundary from '../components/ErrorBoundary';

const SelectField = (props) => {
	const {
		id,
		value,
		onChange,
		options,
		description,
		list_type = null,
		group_level = 0,
		required,
		isMulti = false,
		className,
	} = props;

	const { api } = useContext(AppContext);
	const [currentValue, setCurrentValue] = useState(value);

	const handleChange = (value) => {
		setCurrentValue(value);
	};

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [value, currentValue]);

	return (
		<React.Fragment>
			{group_level === 0 && (
				<input type="hidden" name={id} value={isMulti ? JSON.stringify(currentValue.filter(Boolean)) : currentValue} />
			)}
			<ErrorBoundary>
				<SearchableSelectControl
					id={id}
					value={value}
					onChange={handleChange}
					options={options}
					list_type={list_type}
					required={required}
					isMulti={isMulti}
					url={api.url + '/list'}
					nonce={api.nonce}
					method="post"
					className={className}
				/>
			</ErrorBoundary>
			{description && (
				<ErrorBoundary>
					<p className="description" dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
		</React.Fragment>
	);
};

SelectField.propTypes = {
	className: PT.string,
	id: PT.string,
	value: PT.oneOfType([PT.string, PT.number]),
	onChange: PT.func,
	options: PT.array,
	description: PT.oneOfType([PT.string, PT.element]),
	list_type: PT.string,
	group_level: PT.number,
	required: PT.bool,
	isMulti: PT.bool,
};

SelectField.getHumanTitle = (item, value) => {
	if (Array.isArray(item.options)) {
		const option = item.options.find(i => i.value == value);

		if (option) {
			return option.label;
		}
	}

	return value;
};

export default SelectField;
