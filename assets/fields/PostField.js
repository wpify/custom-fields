import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import PT from 'prop-types';
import AppContext from '../components/AppContext';
import { useDelay, useFetch } from '../helpers';
import SelectControl from '../components/SelectControl';
import MoveButton from '../components/MoveButton';
import CloseButton from '../components/CloseButton';
import SortableControl from '../components/SortableControl';
import ErrorBoundary from '../components/ErrorBoundary';

const PostField = (props) => {
	const {
		id,
		value = null,
		onChange,
		description,
		group_level = 0,
		required,
		isMulti = false,
		className,
		post_type = 'post',
		query_args = [],
	} = props;

	const { api } = useContext(AppContext);
	const { nonce, url } = (api || {});
	const [currentValue, setCurrentValue] = useState(Array.isArray(value) ? value : [value]);
	const [search, setSearch] = useState('');

	const handleChange = (value) => {
		setCurrentValue(value);
	};

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(isMulti ? currentValue : currentValue.find(Boolean));
		}
	}, [onChange, isMulti, value, currentValue]);

	const { fetch, result } = useFetch({ defaultValue: [] });

	const timer = useRef(0);

	useEffect(() => {
		window.clearTimeout(timer.current);

		timer.current = window.setTimeout(() => {
			console.log(nonce, url);
			fetch({
				method: 'post',
				url: url + '/posts',
				nonce: nonce,
				body: { ...props, search },
			});
		}, 500);

		return () => {
			window.clearTimeout(timer.current);
		};
	}, [fetch, search, props, nonce, url]);

	const getSelectedOptions = useCallback(() => {
		return currentValue.map(value => {
			return result.find(option => {
				return String(option.value) === String(value);
			});
		}).filter(Boolean);
	}, [currentValue, result]);

	const handleDelete = (id) => () => {
		setCurrentValue(currentValue.filter(value => String(value) !== String(id)));
	};

	const handleMove = (items) => {
		if (!items.some(item => typeof item === 'object')) {
			setCurrentValue(items);
		}
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
					options={result.filter(option => !currentValue.includes(String(option.value)))}
					onChange={handleAdd}
					value={null}
				/>
			</ErrorBoundary>
			{description && (
				<ErrorBoundary>
					<p className="description" dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
			<div className="wcf-post-selected">
				<ErrorBoundary>
					<SortableControl
						list={currentValue}
						setList={handleMove}
					>
						{selectedOptions.map(option => (
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
						))}
					</SortableControl>
				</ErrorBoundary>
			</div>
		</React.Fragment>
	);
};

PostField.propTypes = {
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
	post_type: PT.string,
	query_args: PT.array,
};

export default PostField;
