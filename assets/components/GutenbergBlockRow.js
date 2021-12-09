import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import ErrorBoundary from './ErrorBoundary';

const GutenbergBlockRow = (props) => {
	const { className, children, item, htmlId = id => id } = props;

  return (
		<div key={item.id} className={classnames('wfc-block-field', `wfc-block-field--${item.type}`, className)}>
			<ErrorBoundary>
				<label htmlFor={htmlId(item.id)} dangerouslySetInnerHTML={{ __html: item.title }}/>
			</ErrorBoundary>
			<ErrorBoundary>
				{children}
			</ErrorBoundary>
		</div>
  );
};

GutenbergBlockRow.propTypes = {
  className: PT.string,
	item: PT.object,
	group_level: PT.number,
	children: PT.element,
	htmlId: PT.func,
};

export default GutenbergBlockRow;
