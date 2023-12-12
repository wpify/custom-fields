import React, { useCallback, useEffect, useRef } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { v4 as uuid } from 'uuid';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { useNormalizedValue } from '../helpers';
import { applyFilters } from '@wordpress/hooks';

const WysiwygField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);
	const {
		id,
		htmlId = id => id,
		onChange,
		description,
		custom_attributes,
		className,
		group_level = 0,
		appContext,
		toolbar,
	} = props;

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [onChange, value, currentValue]);

	const clientId = useRef(uuid());
	const tinymce = useRef();
	const editArea = useRef();

	const handleChange = useCallback((event) => {
		const newcontent = tinymce.current.getContent();

		if (newcontent !== currentValue) {
			setCurrentValue(newcontent);
		}

	}, [setCurrentValue, currentValue]);

	const setup = (editor) => {
		tinymce.current = editor;

		tinymce.current.on('loadContent', () => editor.setContent(currentValue));

		// Make toolbar always visible
		tinymce.current.on('init', () => tinymce.current.fire('focus'));
		tinymce.current.on('blur', () => false);
		tinymce.current.on('focusout', handleChange);

		tinymce.current.addButton('wp_add_media', {
			tooltip: __('Insert Media'),
			icon: 'dashicon dashicons-admin-media',
			cmd: 'WP_Medialib',
		});
	};

	useEffect(() => {
		const { baseURL, suffix } = window.wpEditorL10n.tinymce;
		window.tinymce.EditorManager.overrideDefaults({
			base_url: baseURL,
			suffix,
		});

		const { settings } = window.wpEditorL10n.tinymce;

		const tinymce = {
			...settings,
			toolbar1: toolbar ? toolbar : settings.toolbar1,
			inline: true,
			content_css: false,
			fixed_toolbar_container: `#toolbar-${clientId.current}`,
			setup,
		};

		wp.oldEditor.initialize(`editor-${clientId.current}`, { tinymce });
	}, []);

	useEffect(() => {
		const handleSelectAll = (event) => {
			if (event.code === 'KeyA' && (event.metaKey || event.ctrlKey)) {
				event.stopPropagation();
			}
		};

		editArea.current.addEventListener('keydown', handleSelectAll);

		return () => {
			editArea.current?.removeEventListener('keydown', handleSelectAll);
		};
	}, []);

	const describedBy = description ? id + '-description' : null;

	return (
		<React.Fragment>
			<input
				type="hidden"
				id={appContext.hooks.id(htmlId(id))}
				name={group_level === 0 ? appContext.hooks.name(id) : null}
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
					ref={editArea}
				/>
			</div>
			{description && (
				<ErrorBoundary>
					<p className="description" id={describedBy} dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
		</React.Fragment>
	);
};

WysiwygField.getHumanTitle = (item, innerValue) => {
	return innerValue?.replace(/<[^>]+>/gm, '').replace(/\s+/gm, ' ');
};

export default WysiwygField;
