import React, { useContext, useEffect, useState } from 'react';
import PT from 'prop-types';
import AppContext from '../components/AppContext';
import SearchableSelectControl from '../components/SearchableSelectControl';

const PostField = (props) => {
	const {
		id,
		value = null,
		onChange,
		options,
		description,
		group_level = 0,
		required,
		isMulti = false,
		className,
		post_type = 'post',
		query_args = [],
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
				<input type="hidden" name={id} value={isMulti ? JSON.stringify(currentValue) : currentValue}/>
			)}
			<SearchableSelectControl
				id={id}
				value={value}
				onChange={handleChange}
				options={options}
				required={required}
				isMulti={isMulti}
				url={api.url + '/posts'}
				nonce={api.nonce}
				method="post"
				className={className}
				list_type="post"
				post_type={post_type}
				query_args={query_args}
			/>
			{description && (
				<p className="description" dangerouslySetInnerHTML={{ __html: description }}/>
			)}
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
};

export default PostField;
