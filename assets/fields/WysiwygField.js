import React, { useEffect, useMemo, useState, useRef } from 'react';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';
import { v4 as uuid } from 'uuid';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';

const WysiwygField = (props) => {
	const {
		id,
		htmlId = id => id,
		onChange,
		description,
		custom_attributes,
		className,
		group_level = 0,
	} = props;

	const value = useMemo(() => {
		if (props.generator) {
			return applyFilters('wcf_generator_' + props.generator, props.value, props);
		}

		return props.value || '';
	}, [props]);

	const [currentValue, setCurrentValue] = useState(value);

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [onChange, value, currentValue]);

	const clientId = useRef(uuid());
	const tinymce = useRef();

	const setup = (editor) => {
		tinymce.current = editor;

		tinymce.current.on('loadContent', () => editor.setContent(currentValue));

		// Make toolbar always visible
		tinymce.current.on('init', () => tinymce.current.fire('focus'));
		tinymce.current.on('blur', () => false);

		tinymce.current.addButton( 'wp_add_media', {
			tooltip: __( 'Insert Media' ),
			icon: 'dashicon dashicons-admin-media',
			cmd: 'WP_Medialib',
		} );
	};

	useEffect(() => {
		const { baseURL, suffix } = window.wpEditorL10n.tinymce;
		window.tinymce.EditorManager.overrideDefaults({
			base_url: baseURL,
			suffix,
		});

		const { settings } = window.wpEditorL10n.tinymce;

		wp.oldEditor.initialize(`editor-${clientId.current}`, {
			tinymce: {
				...settings,
				inline: true,
				content_css: false,
				fixed_toolbar_container: `#toolbar-${clientId.current}`,
				setup,
			},
		});
	}, []);

	const timer = useRef();
	const prevContent = useRef(currentValue);

	useEffect(() => {
		timer.current = window.setInterval(() => {
			const newcontent = tinymce.current.getContent();

			if (newcontent !== prevContent.current) {
				setCurrentValue(newcontent);
				prevContent.current = newcontent;
			}
		}, 250);

		return () => {
			window.clearInterval(timer.current);
		}
	}, []);

	const describedBy = description ? id + '-description' : null;

	return (
		<React.Fragment>
			<input
				type="hidden"
				id={htmlId(id)}
				name={group_level === 0 && id}
				value={currentValue}
				{...custom_attributes}
			/>
			<div className={classnames('wcf-tinymce-wrapper', className)}>
				<div
					key="toolbar"
					id={`toolbar-${clientId.current}`}
					className="block-library-classic__toolbar"
				/>
				<div
					key="editor"
					id={`editor-${clientId.current}`}
					className="wp-block-freeform block-library-rich-text__tinymce"
				/>
				<div id={`editor-${clientId.current}`}/>
			</div>
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
	custom_attributes: PT.any,
	group_level: PT.number,
	className: PT.string,
	type: PT.string,
	generator: PT.string,
};

export default WysiwygField;
