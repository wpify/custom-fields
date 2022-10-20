import React, { useEffect, useMemo, useState } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import ErrorBoundary from '../components/ErrorBoundary';
import SelectControl from '../components/SelectControl';
import SortableControl from '../components/SortableControl';
import CloseButton from '../components/CloseButton';
import { useNormalizedValue } from '../helpers';

const SelectedOption = ({ selectedOptions, value, handleDelete, sortable = false }) => {
	const option = selectedOptions.find(o => String(o.value) === String(value));

	return option ? (
		<ErrorBoundary key={option.value}>
			<div
				className={classnames('wcf-post-selected__item', {
					'wcf-post-selected__item--with-image': !!option.thumbnail,
				})}
			>
				{option.thumbnail && (
					<div className="wcf-post-selected__item-image">
						<img src={option.thumbnail} width={100} height={100} alt=""/>
					</div>
				)}
				<div className="wcf-post-selected__item-header">
					<strong dangerouslySetInnerHTML={{ __html: option.label }}/>
					<CloseButton onClick={handleDelete(option.value)}/>
				</div>
				{option.excerpt && (
					<div className="wcf-post-selected__item-description">
						<p dangerouslySetInnerHTML={{ __html: option.excerpt }}/>
					</div>
				)}
			</div>
		</ErrorBoundary>
	) : null;
};

const PostField = (props) => {
	const {
		type,
		id,
		onChange,
		description,
		group_level = 0,
		required,
		isMulti = false,
		className,
		appContext,
		options,
		post_type,
		query_args = {},
		async,
		async_params,
	} = props;

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);

	const otherArgs = useMemo(() => {
		return {
			post_type,
			query_args,
			type,
		};
	}, [post_type, query_args, type]);

	const [selectedOptions, setSelectedOptions] = useState([]);

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(isMulti ? currentValue : currentValue.find(Boolean));
		}
	}, [onChange, value, currentValue]);

	const handleDelete = (id) => () => {
		setCurrentValue(currentValue.filter(value => String(value) !== String(id)));
	};

	const handleAdd = (item) => {
		if (isMulti) {
			const newValues = [...currentValue, item];
			setCurrentValue([...new Set(newValues.map(value => String(value)))]);
		} else {
			setCurrentValue([item]);
		}
	};

	return (
		<ErrorBoundary>
			{group_level === 0 && (
				<input type="hidden" name={id} value={isMulti
					? JSON.stringify(Array.isArray(currentValue) ? currentValue.filter(Boolean) : [])
					: currentValue}/>
			)}
			<SelectControl
				id={id}
				onChange={handleAdd}
				required={required}
				isMulti={isMulti}
				className={className}
				api={appContext.api}
				value={currentValue}
				defaultOptions={options}
				setOptions={setSelectedOptions}
				showSelected={false}
				otherArgs={otherArgs}
				async={async}
				asyncParams={async_params}

			/>

			{description && (
				<ErrorBoundary>
					<p className="description" dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}

			<div className="wcf-post-selected">
				{selectedOptions.length > 1 ? (
					<SortableControl
						items={currentValue.map(o => String(o))}
						setItems={(items) => setCurrentValue(items.map(v => parseInt(v)))}
						allowSort={true}
						renderItem={(value) => (
							<SelectedOption
								selectedOptions={selectedOptions}
								value={value}
								handleDelete={handleDelete}
							/>
						)}
					/>
				) : (
					<>
						{currentValue.map((value) => (
							<SelectedOption
								selectedOptions={selectedOptions}
								value={value}
								handleDelete={handleDelete}
								key={value}
							/>
						))}
					</>
				)}
			</div>
		</ErrorBoundary>
	);
};

PostField.propTypes = {
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

PostField.getHumanTitle = (item, value) => {
	if (Array.isArray(item.options)) {
		const option = item.options.find(i => String(i.value) === String(value));

		if (option) {
			return option.label;
		}
	}

	return value;
};

export default PostField;
