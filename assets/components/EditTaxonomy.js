import React from 'react';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import EditTaxonomyRow from './EditTaxonomyRow';
import ErrorBoundary from './ErrorBoundary';
import RootWrapper from './RootWrapper';

const EditTaxonomy = (props) => {
	const { appContext, handleChange } = props;
	const { items = [] } = appContext;

	return (
		<ScreenContext.Provider value={{ RootWrapper, RowWrapper: EditTaxonomyRow }}>
			{items.map((item) => {
				const Field = getItemComponent(item);

				return (
					<ErrorBoundary key={item.id}>
						<EditTaxonomyRow item={item}>
							<ErrorBoundary>
								<Field
									{...item}
									onChange={handleChange(item)}
									appContext={appContext}
								/>
							</ErrorBoundary>
						</EditTaxonomyRow>
					</ErrorBoundary>
				);
			})}
		</ScreenContext.Provider>
	);
};

export default EditTaxonomy;
