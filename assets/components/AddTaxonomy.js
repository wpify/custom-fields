import React from 'react';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import AddTaxonomyRow from './AddTaxonomyRow';
import ErrorBoundary from './ErrorBoundary';
import RootWrapper from './RootWrapper';

const AddTaxonomy = (props) => {
	const { appContext, handleChange } = props;
	const { items = [] } = appContext;

	return (
		<ScreenContext.Provider value={{ RootWrapper, RowWrapper: AddTaxonomyRow }}>
			{items.map(item => {
				const Field = getItemComponent(item);

				return (
					<ErrorBoundary key={item.id}>
						<AddTaxonomyRow item={item}>
							<ErrorBoundary>
								<Field
									{...item}
									onChange={handleChange(item)}
									appContext={appContext}
								/>
							</ErrorBoundary>
						</AddTaxonomyRow>
					</ErrorBoundary>
				);
			})}
		</ScreenContext.Provider>
	);
};

export default AddTaxonomy;
