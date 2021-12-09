import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MoveButton from '../components/MoveButton';

const SortableItem = (props) => {
	const { id, children, className } = props;
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		position: 'relative',
	};

	return (
		<div ref={setNodeRef} style={style} faded={isDragging.toString()} className={classnames(className, 'wcf-sortable-item')} {...props}>
			{children}
			<MoveButton {...attributes} {...listeners} />
		</div>
	);
};

SortableItem.propTypes = {
	id: PT.any,
	children: PT.any,
	className: PT.string,
};

export default SortableItem;
