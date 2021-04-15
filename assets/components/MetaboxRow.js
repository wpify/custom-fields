import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import ErrorBoundary from './ErrorBoundary';

const MetaboxRow = ({ className, item, children, htmlId = id => id }) => {
  return (
		<p key={item.id} className={classnames(className)}>
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
		</p>
	);
};

MetaboxRow.propTypes = {
  className: PT.string,
	item: PT.object,
	group_level: PT.number,
	children: PT.element,
	htmlId: PT.func,
};

export default MetaboxRow;
