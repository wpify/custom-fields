import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';

const ProductOptionsRow = ({ className, children, item, htmlId = id => id }) => {
  return (
		<p key={item.id} className={classnames('form-field', className)}>
			<label htmlFor={htmlId(item.id)} dangerouslySetInnerHTML={{ __html: item.title }}/>
			{children}
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
