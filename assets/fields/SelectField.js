import React, { useEffect } from 'react';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';
import SelectControl from '../components/SelectControl';
import { useNormalizedValue } from '../helpers';

const SelectField = (props) => {
	const {
		id,
		onChange,
		description,
		group_level = 0,
		required,
		isMulti = false,
		className,
		appContext,
		options,
		list_id,
		async,
	} = props;

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [onChange, value, currentValue]);

	return (
		<ErrorBoundary>
			{group_level === 0 && (
				<input type="hidden" name={id} value={isMulti
					? JSON.stringify(Array.isArray(currentValue) ? currentValue.filter(Boolean) : [])
					: currentValue}/>
			)}
			<SelectControl
				id={id}
				onChange={setCurrentValue}
				required={required}
				isMulti={isMulti}
				className={className}
				api={appContext.api}
				value={currentValue}
				defaultOptions={options}
				listId={list_id}
				async={async}
			/>
			{description && (
				<ErrorBoundary>
					<p className="description" dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
		</ErrorBoundary>
	);
};

SelectField.propTypes = {
	className: PT.string,
	id: PT.string,
	value: PT.oneOfType([PT.string, PT.number]),
	onChange: PT.func,
	options: PT.array,
	description: PT.oneOfType([PT.string, PT.element]),
	group_level: PT.number,
	required: PT.bool,
	isMulti: PT.bool,
	appContext: PT.object,
	generator: PT.string,
	async: PT.bool,
};

SelectField.getHumanTitle = (item, value) => {
	if (Array.isArray(item.options)) {
		const option = item.options.find(i => String(i.value) === String(value));

		if (option) {
			return option.label;
		}
	}

	return value;
};

export default SelectField;
