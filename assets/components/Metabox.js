import React from 'react';
import PT from 'prop-types';
import { renderField } from '../helpers';

const Options = (props) => {
	const { wcf: { items = [] } } = props;

	return (
		<React.Fragment>
			{items.map(item => (
				<p key={item.id || item.name}>
					<label
						htmlFor={item.id || item.name}
						dangerouslySetInnerHTML={{ __html: item.label }}
					/>
					<br />
					{renderField(item)}
				</p>
			))}
		</React.Fragment>
	);
};

Options.propTypes = {
	className: PT.string,
	wcf: PT.object,
};

export default Options;
