import React from 'react';
import classnames from 'classnames';
import ErrorBoundary from './ErrorBoundary';

const AddTaxonomyRow = (props) => {
	const { className, item, children, htmlId = id => id, style } = props;
	const showLabel = !['title'].includes(item.type);

  return (
		<div key={item.id} className={classnames('form-field', className)} style={style}>
			<ErrorBoundary>
				{item.title && showLabel && (
					<label htmlFor={htmlId(item.id)} dangerouslySetInnerHTML={{ __html: item.title }}/>
				)}
			</ErrorBoundary>
			<ErrorBoundary>
				{children}
			</ErrorBoundary>
		</div>
  );
};

export default AddTaxonomyRow;
