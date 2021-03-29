/* eslint-disable react/prop-types */

import React from 'react';
import classnames from 'classnames';

const TitleField = (props) => {
	const { className, title, description, ...rest } = props;

	return (
		<React.Fragment>
			<h2
				className={classnames('regular-text ltr', className)}
				{...rest}
				dangerouslySetInnerHTML={{ __html: title }}
			/>
			{description && (
				<p dangerouslySetInnerHTML={{ __html: description }}/>
			)}
		</React.Fragment>
	);
};

TitleField.noSection = true;

export default TitleField;
