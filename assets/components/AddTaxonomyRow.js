import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import ErrorBoundary from './ErrorBoundary';

const AddTaxonomyRow = (props) => {
	const { className, item, children, htmlId = id => id } = props;
  return (
		<div key={item.id} className={classnames('form-field', className)}>
			<ErrorBoundary>
				{item.title && (
					<label htmlFor={htmlId(item.id)} dangerouslySetInnerHTML={{ __html: item.title }}/>
				)}
			</ErrorBoundary>
			<ErrorBoundary>
				{children}
			</ErrorBoundary>
		</div>
  );
};

AddTaxonomyRow.propTypes = {
  className: PT.string,
	children: PT.element,
	item: PT.object,
	htmlId: PT.func,
};

export default AddTaxonomyRow;
