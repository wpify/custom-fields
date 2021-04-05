import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';

const MetaboxRow = ({ className, item, children, htmlId = id => id }) => {
  return (
		<p key={item.id} className={classnames(className)}>
			<label
				htmlFor={htmlId(item.id)}
				dangerouslySetInnerHTML={{ __html: item.title }}
			/>
			<br />
			{children}
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
