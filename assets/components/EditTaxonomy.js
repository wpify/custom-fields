import React from 'react';
import PT from 'prop-types';
import { renderField } from '../helpers';

const EditTaxonomy = (props) => {
	const { wcf = {} } = props;
	const { items = [] } = wcf;

	return (
		<React.Fragment>
			{items.map(item => (
				<tr key={item.id || item.name} className="form-field">
					<th>
						<label htmlFor={item.id || item.name} dangerouslySetInnerHTML={{ __html: item.label }}/>
					</th>
					<td>
						{renderField(item)}
					</td>
				</tr>
			))}
		</React.Fragment>
	);
};

EditTaxonomy.propTypes = {
	className: PT.string,
	wcf: PT.object,
};

export default EditTaxonomy;
