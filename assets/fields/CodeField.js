import React, { useEffect, useRef, useCallback } from 'react';
import classnames from 'classnames';
import ErrorBoundary from '../components/ErrorBoundary';
import { useNormalizedValue } from '../helpers';

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

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);

	const textarea = useRef();
	const codemirror = useRef();

	if (ref) {
		ref.current = textarea.current;
	}

	const handleChange = useCallback((cm) => {
		setCurrentValue(cm.getValue());
	}, [setCurrentValue]);

	useEffect(() => {
		if (textarea.current) {
			const settings = window.wcf_code_editor_settings || {};
			const currentSettings = settings[mode] || null;

			codemirror.current = wp.codeEditor.initialize(textarea.current, currentSettings);
			codemirror.current.codemirror.on('change', handleChange);
		}
	}, [mode, handleChange]);

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
				value={currentValue}
			/>
			{description && (
				<ErrorBoundary>
					<p className="description" id={describedBy} dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
		</React.Fragment>
	);
});

export default CodeField;
