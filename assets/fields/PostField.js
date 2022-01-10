import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PT from 'prop-types';
import { useFetch } from '../helpers';
import SelectControl from '../components/SelectControl';
import MoveButton from '../components/MoveButton';
import CloseButton from '../components/CloseButton';
import SortableControl from '../components/SortableControl';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const PostField = (props) => {
	const {
		id,
		onChange,
		description,
		group_level = 0,
		required,
		isMulti = false,
		className,
		post_type = 'post',
		query_args = [],
		appContext,
		options = [],
	} = props;

	const value = useMemo(() => {
		const arr = (Array.isArray(props.value) ? props.value : [props.value]).filter(Boolean).map(v => parseInt(v, 10));

		if (props.generator) {
			return applyFilters('wcf_generator_' + props.generator, arr, props);
		}

		return arr;
	}, [props]);

	const { api = {} } = appContext;
	const { url, nonce } = api;
	const [currentValue, setCurrentValue] = useState(value);
	const [search, setSearch] = useState('');

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(isMulti ? currentValue : currentValue.find(Boolean));
		}
	}, [isMulti, value, currentValue, onChange]);

	const { fetch, result } = useFetch({ defaultValue: options });

	const timer = useRef(0);

	useEffect(() => {
		if (search !== '') {
			window.clearTimeout(timer.current);

			timer.current = window.setTimeout(() => {
				if (url && nonce) {
					fetch({
						method: 'post',
						url: url + '/posts',
						nonce: nonce,
						body: {
							id,
							value,
							description,
							group_level,
							required,
							isMulti,
							post_type,
							query_args,
							search
						},
					});
				}
			}, 500);
		}

		return () => {
			window.clearTimeout(timer.current);
		};
	}, [url, nonce, id, value, description, group_level, required, isMulti, post_type, query_args, search, fetch]);

	const getSelectedOptions = useCallback(() => {
		return currentValue.map(value => {
			return result && Array.isArray(result)
				? result.find(option => {
					return String(option.value) === String(value);
				})
				: [];
		}).filter(Boolean);
	}, [currentValue, result]);

	const handleDelete = (id) => () => {
		setCurrentValue(currentValue.filter(value => String(value) !== String(id)));
	};

	const handleAdd = (item) => {
		if (isMulti) {
			const newValues = [...currentValue, item.value];
			setCurrentValue([...new Set(newValues.map(value => String(value)))]);
		} else {
			setCurrentValue([item.value]);
		}
	};

	const selectedOptions = getSelectedOptions();

	return (
		<React.Fragment>
			{group_level === 0 && (
				<input type="hidden" name={id} value={isMulti ? JSON.stringify(currentValue) : currentValue}/>
			)}
			<ErrorBoundary>
				<SelectControl
					onInputChange={setSearch}
					options={result && Array.isArray(result) ? result.filter(option => !currentValue.includes(String(option.value))) : []}
					onChange={handleAdd}
					value={null}
					className={className}
				/>
			</ErrorBoundary>
			{description && (
				<ErrorBoundary>
					<p className="description" dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
			{currentValue && currentValue.length > 0 && (
				<div className="wcf-post-selected">
					<ErrorBoundary>
						<SortableControl
							items={currentValue.map(String)}
							setItems={(items) => setCurrentValue(items.map(v => parseInt(v)))}
							renderItem={(value) => {
								const option = selectedOptions.find(o => o.value.toString() === value.toString());

								return option ? (
									<ErrorBoundary key={option.value}>
										<div className="wcf-post-selected__item">
											<div className="wcf-post-selected__item-header">
												{currentValue.length > 1 && (
													<MoveButton/>
												)}
												<strong dangerouslySetInnerHTML={{ __html: option.label }}/>
												<CloseButton onClick={handleDelete(option.value)}/>
											</div>
											<ErrorBoundary>
												<p dangerouslySetInnerHTML={{ __html: option.excerpt }}/>
											</ErrorBoundary>
										</div>
									</ErrorBoundary>
								) : null;
							}}
						/>
					</ErrorBoundary>
				</div>
			)}
		</React.Fragment>
	);
};

PostField.propTypes = {
	className: PT.string,
	id: PT.string,
	value: PT.oneOfType([PT.string, PT.number, PT.array]),
	onChange: PT.func,
	options: PT.array,
	description: PT.oneOfType([PT.string, PT.element]),
	list_type: PT.string,
	group_level: PT.number,
	required: PT.bool,
	isMulti: PT.bool,
	post_type: PT.string,
	query_args: PT.array,
	appContext: PT.object,
	generator: PT.string,
};

export default PostField;
