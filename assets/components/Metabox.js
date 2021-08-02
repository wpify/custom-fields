import React from 'react';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import MetaboxRow from './MetaboxRow';
import ErrorBoundary from './ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const Metabox = ({ appContext }) => {
	const { items = [] } = appContext;

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: MetaboxRow }}>
			{items.map((item) => {
				const Field = getItemComponent(item);

				return applyFilters('wcf_field_without_section', false, item.type) ? (
					<ErrorBoundary key={item.id}>
						<Field {...item} appContext={appContext}/>
					</ErrorBoundary>
				) : (
					<ErrorBoundary key={item.id}>
						<MetaboxRow item={item}>
							<ErrorBoundary>
								<Field {...item} appContext={appContext}/>
							</ErrorBoundary>
						</MetaboxRow>
					</ErrorBoundary>
				);
			})}
		</ScreenContext.Provider>
	);
};

Metabox.propTypes = {
	appContext: PT.object,
};

export default Metabox;
