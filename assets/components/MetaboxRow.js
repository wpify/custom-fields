import React from 'react';
import classnames from 'classnames';
import ErrorBoundary from './ErrorBoundary';

const MetaboxRow = ({ className, item, children, htmlId = id => id, style }) => {
  return (
		<div key={item.id} className={classnames('wcf-metabox-row', className)} style={style}>
			<ErrorBoundary>
				<label
					htmlFor={htmlId(item.id)}
					dangerouslySetInnerHTML={{ __html: item.title }}
				/>
			</ErrorBoundary>
			<br />
			<ErrorBoundary>
				{children}
			</ErrorBoundary>
		</div>
	);
};

export default MetaboxRow;
