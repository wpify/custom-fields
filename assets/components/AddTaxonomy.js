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
					<ErrorBoundary key={item.id}>
						<AddTaxonomyRow item={item}>
							<ErrorBoundary>
								<Field {...item} />
							</ErrorBoundary>
						</AddTaxonomyRow>
					</ErrorBoundary>
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
