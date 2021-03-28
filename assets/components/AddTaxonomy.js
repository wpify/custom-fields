import React from 'react';
import PT from 'prop-types';
import { renderField } from '../helpers';

const AddTaxonomy = (props) => {
	const { wcf = {} } = props;
	const { items = [] } = wcf;

	return (
		<React.Fragment>
			{items.map(item => (
				<div key={item.id || item.name} className="form-field">
					<label htmlFor={item.id || item.name} dangerouslySetInnerHTML={{ __html: item.label }}/>
					{renderField(item)}
				</div>
			))}
		</React.Fragment>
	);
};

AddTaxonomy.propTypes = {
	className: PT.string,
	wcf: PT.object,
};

export default AddTaxonomy;
