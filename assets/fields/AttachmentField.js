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
		onChange,
	} = props;

	const [currentValues, setCurrentValues] = useState(
		(Array.isArray(value) ? value : [value])
			.filter(Boolean)
			.map(v => parseInt(v, 10))
	);

	const returnValue = isMulti ? currentValues.filter(Boolean) : currentValues.find(Boolean);

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

	const handleOpen = () => {
		const selection = frame.current.state().get('selection');
		currentValues.forEach(currentValue => {
			const attachment = wp.media.attachment(parseInt(currentValue, 10));
			attachment.fetch()
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

		for (let i = 0; i < currentValues.length; i++) {
			const attachment = wp.media.attachment(currentValues[i]);

			attachment.fetch({ success: forceUpdate });
			attachments.push(attachment);
		}

		setAttachments(attachments);
		setCurrentValues(attachments.map(i => i.id));
	}, []);

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(returnValue)) {
			onChange(returnValue);
		}
	}, [value, returnValue]);

	const handleDelete = (attributes) => {
		setCurrentValues(currentValues => currentValues.filter(value => value !== attributes.id));
		setAttachments(attachments => attachments.filter(attachment => attachment.id !== attributes.id));
	};

	const handleMove = (items) => {
		setAttachments(items);
		setCurrentValues(items.map(i => i.id));
	};

	return (
		<div className={classnames(className)}>
			{group_level === 0 && (
				<input type="hidden" name={id} value={returnValue}/>
			)}
			<div className="wcf-media-list">
				<SortableControl
					list={attachments || []}
					setList={handleMove}
				>
					{attachments.map(attachment => (
						<Attachment
							key={attachment.id}
							attachment={attachment}
							onDelete={handleDelete}
							length={attachments.length}
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
