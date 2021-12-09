import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { __ } from '@wordpress/i18n';
import Button from '../components/Button';
import Attachment from '../components/Attachment';
import { useForceUpdate } from '../helpers';
import SortableControl from '../components/SortableControl';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

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

	const value = useMemo(() => {
		let adjusted = props.value;

		if (props.generator) {
			adjusted = applyFilters('wcf_generator_' + props.generator, adjusted, props);
		}

		adjusted = Array.isArray(adjusted) ? adjusted : [adjusted];

		return adjusted.filter(Boolean).map(v => parseInt(v, 10));
	}, [props]);

	const [currentValues, setCurrentValues] = useState(value);

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
	}, [value, returnValue, onChange]);

	const handleDelete = (attributes) => {
		setCurrentValues(currentValues => currentValues.filter(value => value !== attributes.id));
		setAttachments(attachments => attachments.filter(attachment => attachment.id !== attributes.id));
	};

	return (
		<div className={classnames(className)}>
			{group_level === 0 && (
				<input type="hidden" name={id} value={JSON.stringify(returnValue)}/>
			)}
			<div className="wcf-media-list">
				<SortableControl
					items={currentValues.map(String)}
					setItems={(currentValues) => setCurrentValues(currentValues.map(v => parseInt(v, 10)))}
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
			<Button onClick={handleButtonClick}>
				{__('Select media', 'wpify-custom-fields')}
			</Button>
			{description && (
				<ErrorBoundary>
					<p dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
		</div>
	);
};

AttachmentField.propTypes = {
	className: PT.string,
	id: PT.string,
	value: PT.oneOfType([PT.array, PT.string]),
	group_level: PT.number,
	isMulti: PT.bool,
	attachment_type: PT.string,
	onChange: PT.func,
	description: PT.string,
	generator: PT.string,
};

export default AttachmentField;
