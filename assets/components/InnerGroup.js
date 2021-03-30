import React from 'react';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';

const InnerGroup = (props) => {
	const { items = [] } = props;

	return items.map(item => {
		const Field = getItemComponent(item);

		return (
			<React.Fragment key={item.id}>
				<label
					htmlFor={item.id}
					dangerouslySetInnerHTML={{ __html: item.title }}
				/>
				<br/>
				<Field {...props} {...item} />
			</React.Fragment>
		);
	});
};

InnerGroup.propTypes = {
	wcf: PT.object,
	items: PT.array,
};

export default InnerGroup;
