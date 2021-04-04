import React from 'react';
import { ReactSortable } from 'react-sortablejs';

const SortableControl = (props) => {
  return (
		<ReactSortable
			animation={150}
			handle=".wcf-button--move"
			ghostClass="wcf-sortable-ghost"
			dragClass="wcf-sortable-drag"
			{...props}
		/>
  );
};

export default SortableControl;
