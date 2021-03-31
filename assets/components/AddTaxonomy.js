import React from 'react';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import AddTaxonomyRow from './AddTaxonomyRow';

const AddTaxonomy = (props) => {
	const { wcf = {} } = props;
	const { items = [] } = wcf;

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: AddTaxonomyRow }}>
			{items.map(item => {
				const Field = getItemComponent(item);

				return (
					<AddTaxonomyRow key={item.id} item={item}>
						<Field {...item} />
					</AddTaxonomyRow>
				);
			})}
		</ScreenContext.Provider>
	);
};

AddTaxonomy.propTypes = {
	className: PT.string,
	wcf: PT.object,
};

export default AddTaxonomy;
