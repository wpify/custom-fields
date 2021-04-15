import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import ErrorBoundary from './ErrorBoundary';

const EditTaxonomyRow = ({ className, item, children, group_level = 0, htmlId = id => id }) => {
	const label = item.title
		? (
			<ErrorBoundary>
				<label htmlFor={htmlId(item.id)} dangerouslySetInnerHTML={{ __html: item.title }}/>
			</ErrorBoundary>
		)
		: null;

	if (group_level > 1) {
		return (
			<div className={classnames('form-field', className)} data-group-level={group_level}>
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
		<tr key={item.id} className={classnames('form-field', className)} data-group-level={group_level}>
			<th>{label}</th>
			<td>
				<ErrorBoundary>
					{children}
				</ErrorBoundary>
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
