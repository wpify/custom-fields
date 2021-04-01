import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';

const CodeField = (props) => {
	const {
		id,
		value,
		onChange,
		htmlId = id => id,
		description,
		custom_attributes,
		className,
		group_level = 0,
	} = props;
	const textarea = useRef();
	const codemirror = useRef();
	const [currentValue, setCurrentValue] = useState(value);

	useEffect(() => {
		const handleChange = (cm, event) => {
			const value = cm.getValue();
			setCurrentValue(value);

			if (onChange) {
				onChange(value);
			}
		};

		codemirror.current = wp.codeEditor.initialize(textarea.current, window.wcf_code_editor_settings);
		codemirror.current.codemirror.on('change', handleChange);
	}, []);

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
};

export default CodeField;
