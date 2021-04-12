import classnames from 'classnames';
import PT from 'prop-types';
import React from 'react';

const OptionsRow = (props) => {
	const {
		item,
		children,
		group_level = 0,
		className,
		htmlId = id => id,
		withoutWrapper = false,
		withoutSection = false,
		withoutLabel = false,
	} = props;

	const label = item.title
		? <label htmlFor={htmlId(item.id)} dangerouslySetInnerHTML={{ __html: item.title }}/>
		: null;

	if (withoutWrapper) {
		return children;
	}

	if (group_level > 1) {
		return (
			<div className={classnames('form-field', className)} data-group-level={group_level}>
				{!withoutLabel && (<div>{label}</div>)}
				<div>{children}</div>
			</div>
		);
	}

	if (withoutSection) {
		return (
			<tr valign="top" data-group-level={group_level}>
				<td className={classnames('forminp', 'forminp-' + item.type)} colSpan={2} style={{ paddingLeft: 0, paddingRight: 0 }}>
					{children}
				</td>
			</tr>
		)
	}

	return (
		<tr valign="top" data-group-level={group_level}>
			<th scope="row" className="titledesc">
				{!withoutLabel && label}
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
