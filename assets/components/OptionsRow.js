import classnames from 'classnames';
import PT from 'prop-types';
import React from 'react';

const OptionsRow = (props) => {
	const { item, children, group_level, className, htmlId = id => id } = props;

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
		<tr valign="top" data-group-level={group_level}>
			<th scope="row" className="titledesc">
				{label}
			</th>
			<td className={classnames('forminp', 'forminp-' + item.type)}>
				{children}
			</td>
		</tr>
	);
};

OptionsRow.propTypes = {
	item: PT.object,
	group_level: PT.number,
	children: PT.element,
	className: PT.string,
	htmlId: PT.func,
};

export default OptionsRow;
