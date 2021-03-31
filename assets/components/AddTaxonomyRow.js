import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';

const AddTaxonomyRow = ({ className, item, children, htmlId = id => id }) => {
  return (
		<div key={item.id} className={classnames('form-field', className)}>
			{item.title && (
				<label htmlFor={htmlId(item.id)} dangerouslySetInnerHTML={{ __html: item.title }}/>
			)}
			{children}
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
