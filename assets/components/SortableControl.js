import React from 'react';
import { ReactSortable } from 'react-sortablejs';
import ErrorBoundary from './ErrorBoundary';

const SortableControl = (props) => {
  return (
  	<ErrorBoundary>
			<ReactSortable
				animation={150}
				handle=".wcf-button--move"
				ghostClass="wcf-sortable-ghost"
				dragClass="wcf-sortable-drag"
				{...props}
			/>
		</ErrorBoundary>
  );
};

export default SortableControl;
