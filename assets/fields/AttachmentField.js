import React, { useCallback, useEffect, useRef } from 'react';
import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import Button from '../components/Button';
import Attachment from '../components/Attachment';
import { useNormalizedValue } from '../helpers';
import SortableControl from '../components/SortableControl';
import ErrorBoundary from '../components/ErrorBoundary';

const AttachmentField = (props) => {
	const {
		id,
		className,
		group_level = 0,
		isMulti = false,
		attachment_type,
		onChange,
		description,
		appContext,
	} = props;

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);

	const returnValue = isMulti ? currentValue.filter(Boolean) : currentValue.find(Boolean);
	const frame = useRef();
	const { wp } = window;

	const handleButtonClick = useCallback(() => {
		frame.current.open();
	}, []);

	const handleClose = useCallback(() => {
		const selection = frame.current.state().get('selection');
		const nextItems = [];

		selection.each(attachment => {
			nextItems.push(attachment.id);
		});

		setCurrentValue(function (currentValue) {
			const nextCurrentValue = isMulti ? [...currentValue, ...nextItems] : nextItems;
			return [...new Set(nextCurrentValue)]
		});
	}, [setCurrentValue, isMulti]);

	const handleOpen = useCallback(function () {
	}, []);

	useEffect(() => {
		frame.current = wp.media({
			title: isMulti
				? __('Select attachments', 'wpify-custom-fields')
				: __('Select attachment', 'wpify-custom-fields'),
			multiple: isMulti,
			library: { type: attachment_type },
		});

		frame.current.on('close', handleClose);
		frame.current.on('open', handleOpen);
	}, [handleOpen, handleClose]);

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(returnValue);
		}
	}, [value, returnValue, currentValue, onChange]);

	const handleDelete = (id) => {
		setCurrentValue(currentValue => currentValue.filter(value => value !== id));
	};

	return (
		<div className={classnames(className)}>
			{group_level === 0 && (
				<input type="hidden" name={appContext.hooks.name(id)} value={JSON.stringify(returnValue)}/>
			)}
			{isMulti ? (
				<div className="wcf-media-list">
					<SortableControl
						allowSort={true}
						items={currentValue.map(String)}
						setItems={(currentValue) => setCurrentValue(currentValue.map(v => parseInt(v, 10)))}
						renderItem={(id) => {
							return (
								<ErrorBoundary key={id}>
									<Attachment
										onDelete={handleDelete}
										length={currentValue.length}
										id={parseInt(id, 10)}
									/>
								</ErrorBoundary>
							);
						}}
					/>
				</div>
			) : currentValue.find(Boolean) ? (
				<ErrorBoundary>
					<Attachment
						id={currentValue.find(Boolean)}
						onDelete={handleDelete}
					/>
				</ErrorBoundary>
			) : null}
			<div className="wcf-media-buttons">
				<Button onClick={handleButtonClick}>
					{isMulti ? __('Add attachments', 'wpify-custom-fields') : __('Select attachment', 'wpify-custom-fields')}
				</Button>
			</div>
			{description && (
				<ErrorBoundary>
					<p dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
		</div>
	);
};

export default AttachmentField;
