/* eslint-disable react/prop-types */
import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { renderField } from '../helpers';

const CustomFields = (props) => {
	const { wcf = {}, className } = props;
	const { items = [] } = wcf;

	return (
		<div className={classnames(className)}>
			<p>Here we have some custom fields!</p>

			{items.map(item => renderField(item))}
		</div>
	);
};

CustomFields.propTypes = {
	className: PT.string,
};

export default CustomFields;
