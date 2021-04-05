import React, { useContext } from 'react';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import EditTaxonomyRow from './EditTaxonomyRow';
import AppContext from './AppContext';
import ErrorBoundary from './ErrorBoundary';

const EditTaxonomy = () => {
	const data = useContext(AppContext);
	const { items = [] } = data;

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: EditTaxonomyRow }}>
			{items.map((item) => {
				const Field = getItemComponent(item);

				return (
					<EditTaxonomyRow key={item.id} item={item}>
						<ErrorBoundary>
							<Field {...item} />
						</ErrorBoundary>
					</EditTaxonomyRow>
				);
			})}
		</ScreenContext.Provider>
	);
};

EditTaxonomy.propTypes = {
	className: PT.string,
	wcf: PT.object,
	group_level: PT.number,
};

export default EditTaxonomy;
