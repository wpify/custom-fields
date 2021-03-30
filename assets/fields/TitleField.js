/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';

const TitleField = (props) => {
	const { className, title, description, ...rest } = props;

	return (
		<React.Fragment>
			<h2
				{...rest}
				className={classnames('regular-text ltr', className)}
				dangerouslySetInnerHTML={{ __html: title }}
			/>
			{description && (
				<p dangerouslySetInnerHTML={{ __html: description }}/>
			)}
		</React.Fragment>
	);
};

TitleField.noSection = true;
TitleField.noLabel = true;

export default TitleField;
