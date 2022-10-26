import React, { useCallback, useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import Button from '../components/Button';
import Attachment from '../components/Attachment';
import { useForceUpdate, useNormalizedValue } from '../helpers';
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
	} = props;

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);

	const returnValue = isMulti ? currentValue.filter(Boolean) : currentValue.find(Boolean);
	const frame = useRef();
	const [attachments, setAttachments] = useState([]);
	const forceUpdate = useForceUpdate();
	const { wp } = window;

	const handleButtonClick = useCallback(() => {
		frame.current.open();
	}, []);

	const handleClose = useCallback(() => {
		const selection = frame.current.state().get('selection');
		const attachments = [];

		selection.each(attachment => attachments.push(attachment));
		setAttachments(attachments);
		setCurrentValue(attachments.map(attachment => attachment.id));
	}, []);

	const handleOpen = () => {
		const selection = frame.current.state().get('selection');
		currentValue.forEach(currentValue => {
			const attachment = wp.media.attachment(parseInt(currentValue, 10));
			attachment.fetch();
			selection.add(attachment ? [attachment] : []);
		});
	};

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

		const attachments = [];

		for (let i = 0; i < currentValue.length; i++) {
			const attachment = wp.media.attachment(currentValue[i]);

			attachment.fetch({ success: forceUpdate });
			attachments.push(attachment);
		}

		setAttachments(attachments);
		setCurrentValue(attachments.map(i => i.id));
	}, []);

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(returnValue);
		}
	}, [value, returnValue, currentValue, onChange]);

	const handleDelete = (attributes) => {
		setCurrentValue(currentValue => currentValue.filter(value => value !== attributes.id));
		setAttachments(attachments => attachments.filter(attachment => attachment.id !== attributes.id));
	};

	return (
		<div className={classnames(className)}>
			{group_level === 0 && (
				<input type="hidden" name={id} value={JSON.stringify(returnValue)}/>
			)}
			{isMulti && currentValue.length > 1 ? (
				<div className="wcf-media-list">
					<SortableControl
						items={currentValue.map(String)}
						setItems={(currentValue) => setCurrentValue(currentValue.map(v => parseInt(v, 10)))}
						renderItem={(id) => {
							const attachment = attachments.find(a => a.id === parseInt(id, 10));

							return attachment ? (
								<ErrorBoundary key={id}>
									<Attachment
										attachment={attachment}
										onDelete={handleDelete}
										length={attachments.length}
									/>
								</ErrorBoundary>
							) : null;
						}}
					/>
				</div>
			) : attachments.find(Boolean) ? (
				<ErrorBoundary>
					<Attachment
						attachment={attachments.find(Boolean)}
						onDelete={handleDelete}
					/>
				</ErrorBoundary>
			) : null}
			<div className="wcf-media-buttons">
				<Button onClick={handleButtonClick}>
					{__('Select media', 'wpify-custom-fields')}
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
