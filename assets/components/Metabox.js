import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { renderField } from '../helpers';

const Options = (props) => {
	const { wcf = {}, className } = props;
	const { items = [] } = wcf;

	return (
		<React.Fragment>
			{items.map(item => (
				<label key={item.id || item.name} htmlFor={item.id || item.name}>
					<span dangerouslySetInnerHTML={{ __html: item.label }} />
					{renderField(item)}
				</label>
			))}
		</React.Fragment>
	);
};

Options.propTypes = {
	className: PT.string,
	wcf: PT.object,
};

export default Options;
