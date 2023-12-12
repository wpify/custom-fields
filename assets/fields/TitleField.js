import React from 'react';
import classnames from 'classnames';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const TitleField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);
	const { className, title, description, custom_attributes } = props;
	return (
		<React.Fragment>
			<ErrorBoundary>
				<h2
					className={classnames('regular-text ltr', className)}
					dangerouslySetInnerHTML={{ __html: title }}
					{...custom_attributes}
				/>
			</ErrorBoundary>
			{description && (
				<ErrorBoundary>
					<p dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
		</React.Fragment>
	);
};

export default TitleField;
