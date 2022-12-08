import React, { useCallback, useEffect, useState } from 'react';
import classnames from 'classnames';
import CloseButton from './CloseButton';

const getImageSize = ({
	attributes = {},
	size = 'thumbnail',
	maxWidth = 150,
	maxHeight = 150,
}) => {
	const image = attributes && attributes.sizes && attributes.sizes[size]
		? attributes.sizes[size]
		: {
			url: attributes.icon,
			width: 48,
			height: 64,
		};

	const multiplicator = image.height > image.width
		? maxHeight / image.height
		: maxWidth / image.width;

	image.width = image.width * multiplicator;
	image.height = image.height * multiplicator;

	return image;
};

const Attachment = (props) => {
	const { className, onDelete, id } = props;
	const [attachment, setAttachment] = useState();

	const handleDelete = useCallback(() => {
		onDelete(id);
	}, [onDelete, attachment]);

	useEffect(function () {
		const wpattachment = wp.media.attachment(id);
		wpattachment.fetch({ success: setAttachment });
	}, [id, setAttachment]);

	if (!attachment) {
		return null;
	}

	const { attributes } = attachment;

	const editLink = new URL(attributes.editLink.replace(/wp-admin\/post\.php/, 'wp-admin/upload.php'));
	const editLinkSearch = new URLSearchParams(editLink.search);
	editLinkSearch.set('item', editLinkSearch.get('post'));
	editLinkSearch.delete('post');
	editLinkSearch.delete('action');
	editLink.search = editLinkSearch;

	const image = getImageSize({
		attributes,
		maxWidth: 50,
		maxHeight: 50,
	});

	return (
		<div className={classnames(className, 'wcf-attachment')} key={props.id}>
			<div className="wcf-attachment__image">
				{image ? (
					<img src={image.url} width={image.width} height={image.height} alt={attributes.title} />
				) : (
					<img src={attributes.icon} width={48} height={64} alt={attributes.title} />
				)}
			</div>
			<div className="wcf-attachment__description">
				<strong>
					<a href={editLink} target="_blank">
						{attributes.title}
					</a>
				</strong>
				<br/>
				[<a href={attributes.url} target="_blank">{attributes.filename}</a>, {attributes.filesizeHumanReadable}]
			</div>
			{onDelete && (
				<CloseButton onClick={handleDelete} />
			)}
		</div>
	);
};

export default Attachment;
