import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import SortableItem from './SortableItem';

const SortableControl = (props) => {
	const { items, setItems, renderItem, allowSort } = props;

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event) => {
		const { active, over } = event;

		if (active.id !== over.id) {
			const oldIndex = items.indexOf(active.id);
			const newIndex = items.indexOf(over.id);

			setItems(arrayMove(items, oldIndex, newIndex));
		}
	};

	if (!allowSort) {
		return (
			<ErrorBoundary>
				{items.map((item, index) => (
					<div key={item} id={item} index={index}>
						{renderItem(item, index)}
					</div>
				))}
			</ErrorBoundary>
		);
	}

	return Array.isArray(items) ? (
		<ErrorBoundary>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext items={items}>
					<div className='wcf-sortable-items'>
						{items.map((item, index) => (
							<SortableItem key={item} id={item} index={index}>
								{renderItem(item, index)}
							</SortableItem>
						))}
					</div>
				</SortableContext>
			</DndContext>
		</ErrorBoundary>
	) : null;
};

export default SortableControl;
