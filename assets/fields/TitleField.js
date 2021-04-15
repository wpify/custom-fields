import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';

const TitleField = (props) => {
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

TitleField.propTypes = {
	className: PT.string,
	title: PT.string,
	description: PT.string,
	custom_attributes: PT.object,
};

TitleField.noSection = true;
TitleField.noLabel = true;

export default TitleField;
