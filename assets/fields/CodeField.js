import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';

const CodeField = React.forwardRef((props, ref) => {
	const {
		id,
		value,
		onChange,
		htmlId = id => id,
		description,
		custom_attributes,
		className,
		group_level = 0,
		mode = null,
	} = props;

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
	}, []);

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [value, currentValue]);

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
		</React.Fragment>
	);
});

export default CodeField;
