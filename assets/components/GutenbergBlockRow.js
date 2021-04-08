import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';

const GutenbergBlockRow = ({ className, children, item, htmlId = id => id }) => {
  return (
		<p key={item.id} className={classnames('wfc-block-field', className)}>
			<label htmlFor={htmlId(item.id)} dangerouslySetInnerHTML={{ __html: item.title }}/>
			{children}
		</p>
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
