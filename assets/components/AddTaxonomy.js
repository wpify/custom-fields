import React from 'react';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';

const AddTaxonomy = (props) => {
	const { wcf = {} } = props;
	const { items = [] } = wcf;

	return (
		<React.Fragment>
			{items.map(item => {
				const Field = getItemComponent(item);

				return (
					<div key={item.id} className="form-field">
						{!Field.noSection && (
							<label htmlFor={item.id} dangerouslySetInnerHTML={{ __html: item.title }}/>
						)}
						<Field {...item} />
					</div>
				);
			})}
		</React.Fragment>
	);
};

AddTaxonomy.propTypes = {
	className: PT.string,
	wcf: PT.object,
};

export default AddTaxonomy;
