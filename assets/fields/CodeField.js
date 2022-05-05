import React, { useEffect, useMemo, useRef, useState } from 'react';
import classnames from 'classnames';
import ErrorBoundary from '../components/ErrorBoundary';
import PT from 'prop-types';
import { applyFilters } from '@wordpress/hooks';
import { castString } from '../helpers';

const CodeField = React.forwardRef((props, ref) => {
	const {
		id,
		onChange,
		htmlId = id => id,
		description,
		custom_attributes,
		className,
		group_level = 0,
		mode = null,
	} = props;

	const value = useMemo(() => {
		if (props.generator) {
			return castString(applyFilters('wcf_generator_' + props.generator, props.value, props));
		}

		return castString(props.value);
	}, [props]);

	const textarea = useRef();
	const codemirror = useRef();
	const [currentValue, setCurrentValue] = useState(value);

	if (ref) {
		ref.current = textarea.current;
	}

	const handleChange = (cm) => {
		setCurrentValue(cm.getValue());
	};

	useEffect(() => {
		if (textarea.current) {
			const settings = window.wcf_code_editor_settings || {};
			const currentSettings = settings[mode] || null;

			codemirror.current = wp.codeEditor.initialize(textarea.current, currentSettings);
			codemirror.current.codemirror.on('change', handleChange);
		}
	}, [mode]);

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [onChange, value, currentValue]);

	const describedBy = description ? id + '-description' : null;

	return (
		<React.Fragment>
			<textarea
				ref={textarea}
				id={htmlId(id)}
				name={group_level === 0 && id}
				aria-describedby={description && describedBy}
				className={classnames('large-text', className)}
				rows={10}
				cols={50}
				{...custom_attributes}
			>{currentValue}</textarea>
			{description && (
				<ErrorBoundary>
					<p className="description" id={describedBy} dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
		</React.Fragment>
	);
});

CodeField.propTypes = {
	id: PT.string,
	value: PT.string,
	onChange: PT.func,
	htmlId: PT.string,
	description: PT.string,
	custom_attributes: PT.object,
	className: PT.string,
	group_level: PT.number,
	mode: PT.any,
	generator: PT.string,
}

export default CodeField;
