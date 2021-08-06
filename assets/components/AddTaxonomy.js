import React from 'react';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import AddTaxonomyRow from './AddTaxonomyRow';
import ErrorBoundary from './ErrorBoundary';

const AddTaxonomy = (props) => {
	const { appContext } = props;
	const { items = [] } = appContext;

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: AddTaxonomyRow }}>
			{items.map(item => {
				const Field = getItemComponent(item);

				return (
					<ErrorBoundary key={item.id}>
						<AddTaxonomyRow item={item}>
							<ErrorBoundary>
								<Field {...item} appContext={appContext}/>
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
	appContext: PT.object,
};

export default AddTaxonomy;
