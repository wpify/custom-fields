import React, { useCallback, useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { __ } from '@wordpress/i18n';
import Button from '../components/Button';
import Attachment from '../components/Attachment';
import { useForceUpdate } from '../helpers';
import SortableControl from '../components/SortableControl';

const AttachmentField = (props) => {
	const {
		id,
		value,
		className,
		group_level = 0,
		isMulti = false,
		attachment_type,
	} = props;

	const [currentValues, setCurrentValues] = useState(
		(Array.isArray(value) ? value : [value])
			.filter(Boolean)
			.map(v => parseInt(v, 10))
	);

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
		setCurrentValues(attachments.map(attachment => attachment.id));
	}, []);

	const handleOpen = useCallback(() => {
		const selection = frame.current.state().get('selection');
		selection.add(attachments);
	}, [attachments]);

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

		for (let i = 0; i < currentValues.length; i++) {
			const attachment = wp.media.attachment(currentValues[i]);

			attachment.fetch({ success: forceUpdate });
			attachments.push(attachment);
		}

		setAttachments(attachments);
	}, []);

	const handleDelete = (attributes) => {
		setCurrentValues(currentValues => currentValues.filter(value => value !== attributes.id));
		setAttachments(attachments => attachments.filter(attachment => attachment.id !== attributes.id));
	};

	const handleMove = (items) => {
		if (!items.some(item => typeof item === 'object')) {
			setCurrentValues(items);
			setAttachments(attachments => items.map(item => attachments.find(a => String(a.id) === String(item))));
		}
	};

	return (
		<div className={classnames(className)}>
			{group_level === 0 && (
				<input type="hidden" name={id} value={isMulti ? JSON.stringify(currentValues.filter(Boolean)) : currentValues}/>
			)}
			<div className="wcf-media-list">
				<SortableControl
					list={currentValues || []}
					setList={handleMove}
				>
					{attachments.map(attachment => (
						<Attachment
							key={attachment.id}
							attachment={attachment}
							onDelete={handleDelete}
						/>
					))}
				</SortableControl>
			</div>
			<Button onClick={handleButtonClick}>
				{__('Select media', 'wpify-custom-fields')}
			</Button>
		</div>
	);
};

AttachmentField.propTypes = {
	className: PT.string,
};

export default AttachmentField;
