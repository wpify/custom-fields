import classnames from 'classnames';
import React from 'react';
import ErrorBoundary from './ErrorBoundary';

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
		style,
	} = props;

	const label = item.title
		? (
			<ErrorBoundary>
				<label htmlFor={htmlId(item.id)} dangerouslySetInnerHTML={{ __html: item.title }}/>
			</ErrorBoundary>
		)
		: null;

	if (withoutWrapper) {
		return children;
	}

	if (group_level > 2) {
		return (
			<div className={classnames('form-field', className)} data-group-level={group_level} style={style}>
				{!withoutLabel && (<div>{label}</div>)}
				<div>
					<ErrorBoundary>
						{children}
					</ErrorBoundary>
				</div>
			</div>
		);
	}

	if (withoutSection) {
		return (
			<tr valign="top" data-group-level={group_level} style={style}>
				<td className={classnames('forminp', 'forminp-' + item.type)} colSpan={2} style={{ paddingLeft: 0, paddingRight: 0 }}>
					<ErrorBoundary>
						{children}
					</ErrorBoundary>
				</td>
			</tr>
		)
	}

	return (
		<tr valign="top" data-group-level={group_level} style={style}>
			<th scope="row" className="titledesc">
				{!withoutLabel && label}
			</th>
			<td className={classnames('forminp', 'forminp-' + item.type)}>
				<ErrorBoundary>
					{children}
				</ErrorBoundary>
			</td>
		</tr>
	);
};

export default OptionsRow;
