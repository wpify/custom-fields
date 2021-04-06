import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import CloseButton from './CloseButton';
import MoveButton from './MoveButton';

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
	const { className, attachment = {}, onDelete, length = 1 } = props;
	const { attributes } = attachment;

	const image = getImageSize({
		attributes,
		maxWidth: 50,
		maxHeight: 50,
	});

	return (
		<div className={classnames(className, 'wcf-attachment')} key={props.id}>
			{length > 1 && (
				<MoveButton />
			)}
			<div className="wcf-attachment__image">
				{image ? (
					<img src={image.url} width={image.width} height={image.height}/>
				) : (
					<img src={attributes.icon} width={48} height={64} alt={attributes.title}/>
				)}
			</div>
			<div className="wcf-attachment__description">
				<strong>
					<a href={attributes.editLink} target="_blank">
						{attributes.title}
					</a>
				</strong>
				<br/>
				[<a href={attributes.url} target="_blank">{attributes.filename}</a>, {attributes.filesizeHumanReadable}]
			</div>
			{onDelete && (
				<CloseButton onClick={() => onDelete(attachment)} />
			)}
		</div>
	);
};

Attachment.propTypes = {
	className: PT.string,
	attachment: PT.object,
	onDelete: PT.func,
	length: PT.number,
};

export default Attachment;
