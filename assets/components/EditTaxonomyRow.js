import React from 'react';
import classnames from 'classnames';
import ErrorBoundary from './ErrorBoundary';

const EditTaxonomyRow = ({ className, item, children, group_level = 0, htmlId = id => id, style }) => {
	const showLabel = !['title'].includes(item.type);
	const label = item.title && showLabel
		? (
			<ErrorBoundary>
				<label htmlFor={htmlId(item.id)} dangerouslySetInnerHTML={{ __html: item.title }}/>
			</ErrorBoundary>
		)
		: null;

	if (group_level > 1) {
		return (
			<div className={classnames('form-field', className)} data-group-level={group_level} style={style}>
				<div>{label}</div>
				<div>
					<ErrorBoundary>
						{children}
					</ErrorBoundary>
				</div>
			</div>
		);
	}

	return (
		<tr key={item.id} className={classnames('form-field', className)} data-group-level={group_level} style={style}>
			<th>{label}</th>
			<td>
				<ErrorBoundary>
					{children}
				</ErrorBoundary>
			</td>
		</tr>
	);
};

export default EditTaxonomyRow;
