import React from 'react';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import EditTaxonomyRow from './EditTaxonomyRow';
import ErrorBoundary from './ErrorBoundary';

const EditTaxonomy = (props) => {
	const { appContext } = props;
	const { items = [] } = appContext;

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: EditTaxonomyRow }}>
			{items.map((item) => {
				const Field = getItemComponent(item);

				return (
					<ErrorBoundary key={item.id}>
						<EditTaxonomyRow item={item}>
							<ErrorBoundary>
								<Field {...item} appContext={appContext}/>
							</ErrorBoundary>
						</EditTaxonomyRow>
					</ErrorBoundary>
				);
			})}
		</ScreenContext.Provider>
	);
};

EditTaxonomy.propTypes = {
	className: PT.string,
	appContext: PT.object,
	group_level: PT.number,
};

export default EditTaxonomy;
