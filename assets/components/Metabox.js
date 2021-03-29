import React from 'react';
import PT from 'prop-types';
import { getItemComponent, renderField } from '../helpers';

const Options = (props) => {
	const { wcf: { items = [] } } = props;

	return (
		<React.Fragment>
			{items.map(item => {
				const Field = getItemComponent(item);

				return Field.noSection ? (
					<Field {...item} />
				) : (
					<p key={item.id}>
						<label
							htmlFor={item.id}
							dangerouslySetInnerHTML={{ __html: item.title }}
						/>
						<br />
						<Field {...item} />
					</p>
				);
			})}
		</React.Fragment>
	);
};

Options.propTypes = {
	className: PT.string,
	wcf: PT.object,
};

export default Options;
