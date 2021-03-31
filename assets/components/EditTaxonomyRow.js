import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';

const EditTaxonomyRow = ({ className, item, children, group_level = 0, htmlId = id => id }) => {
	const label = item.title
		? <label htmlFor={htmlId(item.id)} dangerouslySetInnerHTML={{ __html: item.title }}/>
		: null;

	if (group_level > 1) {
		return (
			<div className={classnames('form-field', className)} data-group-level={group_level}>
				<div>{label}</div>
				<div>{children}</div>
			</div>
		);
	}

	return (
		<tr key={item.id} className={classnames('form-field', className)} data-group-level={group_level}>
			<th>
				{label}
			</th>
			<td>
				{children}
			</td>
		</tr>
	);
};

EditTaxonomyRow.propTypes = {
  className: PT.string,
	item: PT.object,
	children: PT.element,
	group_level: PT.number,
	htmlId: PT.func,
};

export default EditTaxonomyRow;
