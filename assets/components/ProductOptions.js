import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { renderField } from '../helpers';

const Options = (props) => {
	const { wcf = {}, className } = props;
	const { items = [] } = wcf;

	return (
		<div className={classnames(className, 'options_group')}>
			{items.map(item => (
				<p key={item.id || item.name} className="form-field">
					<label htmlFor={item.id || item.name} dangerouslySetInnerHTML={{ __html: item.label }}/>
					{renderField(item)}
				</p>
			))}
		</div>
	);
};

Options.propTypes = {
	className: PT.string,
	wcf: PT.object,
};

export default Options;
