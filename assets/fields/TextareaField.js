import React, { useEffect } from 'react';
import classnames from 'classnames';
import ErrorBoundary from '../components/ErrorBoundary';
import { useNormalizedValue } from '../helpers';
import { applyFilters } from '@wordpress/hooks';

const TextareaField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);
	const {
		id,
		htmlId = id => id,
		onChange,
		description,
		custom_attributes,
		className,
		group_level = 0,
		appContext,
	} = props;

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);

	const handleChange = (event) => {
		setCurrentValue(event.target.value);
	};

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [onChange, value, currentValue]);

	const describedBy = description ? id + '-description' : null;

	return (
		<React.Fragment>
			<textarea
				id={appContext.hooks.id(htmlId(id))}
				name={group_level === 0 ? appContext.hooks.name(id) : null}
				onChange={handleChange}
				aria-describedby={description && describedBy}
				className={classnames('large-text', className)}
				rows={10}
				cols={50}
				value={currentValue}
				{...custom_attributes}
			/>
			{description && (
				<ErrorBoundary>
					<p className="description" id={describedBy} dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
		</React.Fragment>
	);
};

export default TextareaField;
