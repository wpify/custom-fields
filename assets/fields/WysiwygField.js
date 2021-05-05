import React, { useEffect, useState, useRef } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import Quill from 'quill';
import ErrorBoundary from '../components/ErrorBoundary';

const WysiwygField = (props) => {
	const {
		id,
		htmlId = id => id,
		value,
		onChange,
		description,
		custom_attributes,
		className,
		group_level = 0,
	} = props;

	const [currentValue, setCurrentValue] = useState(value);
	const quill = useRef();
	const root = useRef();
	const initialText = useRef(currentValue);

	const handleChange = () => {
		setCurrentValue(root.current.querySelector('.ql-editor').innerHTML);
	};

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [onChange, value, currentValue]);

	useEffect(() => {
		quill.current = new Quill(root.current, {
			theme: 'snow',
		});

		quill.current.on('text-change', handleChange);
	}, []);

	const describedBy = description ? id + '-description' : null;

	return (
		<React.Fragment>
			{group_level === 0 && (
				<input type="hidden" name={id} value={currentValue} />
			)}
			<div
				ref={root}
				id={htmlId(id)}
				onChange={handleChange}
				aria-describedby={description && describedBy}
				className={classnames('wcf-wysiwyg-field', className)}
				{...custom_attributes}
				dangerouslySetInnerHTML={{ __html: initialText.current }}
			/>
			{description && (
				<ErrorBoundary>
					<p className="description" id={describedBy} dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
		</React.Fragment>
	);
};

WysiwygField.propTypes = {
	id: PT.string,
	htmlId: PT.func,
	value: PT.string,
	onChange: PT.func,
	description: PT.oneOfType([PT.string, PT.element]),
	suffix: PT.oneOfType([PT.string, PT.element]),
	custom_attributes: PT.object,
	group_level: PT.number,
	className: PT.string,
	type: PT.string,
};

export default WysiwygField;
