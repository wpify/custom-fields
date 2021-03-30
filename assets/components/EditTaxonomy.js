import React from 'react';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';

const EditTaxonomy = (props) => {
	const { wcf = {} } = props;
	const { items = [] } = wcf;

	return (
		<React.Fragment>
			{items.map(item => {
				const Field = getItemComponent(item);

				return (
					<tr key={item.id} className="form-field">
						{Field.noSection ? (
							<td colSpan={2} style={{ padding: 0 }}>
								<Field {...props} {...item} />
							</td>
						) : (
							<React.Fragment>
								<th>
									<label htmlFor={item.id} dangerouslySetInnerHTML={{ __html: item.title }}/>
								</th>
								<td>
									<Field {...props} {...item} />
								</td>
							</React.Fragment>
						)}
					</tr>
				);
			})}
		</React.Fragment>
	);
};

EditTaxonomy.propTypes = {
	className: PT.string,
	wcf: PT.object,
};

export default EditTaxonomy;
