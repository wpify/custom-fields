import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import ErrorBoundary from './ErrorBoundary';

const ProductOptionsRow = ({ className, children, item, htmlId = id => id }) => {
  return (
		<p className={classnames('form-field', className)}>
			<ErrorBoundary>
				<label htmlFor={htmlId(item.id)} dangerouslySetInnerHTML={{ __html: item.title }} />
			</ErrorBoundary>
			<ErrorBoundary>
				{children}
			</ErrorBoundary>
		</p>
  );
};

ProductOptionsRow.propTypes = {
  className: PT.string,
	item: PT.object,
	group_level: PT.number,
	children: PT.element,
	htmlId: PT.func,
};

export default ProductOptionsRow;
