import React, { useContext } from 'react';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import AddTaxonomyRow from './AddTaxonomyRow';
import AppContext from './AppContext';
import ErrorBoundary from './ErrorBoundary';

const AddTaxonomy = () => {
	const data = useContext(AppContext);
	const { items = [] } = data;

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: AddTaxonomyRow }}>
			{items.map(item => {
				const Field = getItemComponent(item);

				return (
					<AddTaxonomyRow key={item.id} item={item}>
						<ErrorBoundary>
							<Field {...item} />
						</ErrorBoundary>
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
