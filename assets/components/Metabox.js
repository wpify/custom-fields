import React, { useContext } from 'react';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import MetaboxRow from './MetaboxRow';
import AppContext from './AppContext';
import ErrorBoundary from './ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const Metabox = () => {
	const data = useContext(AppContext);
	const { items = [] } = data;

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: MetaboxRow }}>
			{items.map((item) => {
				const Field = getItemComponent(item);

				return applyFilters('wcf_field_without_section', false, item.type) ? (
					<ErrorBoundary key={item.id}>
						<Field {...item} />
					</ErrorBoundary>
				) : (
					<ErrorBoundary key={item.id}>
						<MetaboxRow item={item}>
							<ErrorBoundary>
								<Field {...item} />
							</ErrorBoundary>
						</MetaboxRow>
					</ErrorBoundary>
				);
			})}
		</ScreenContext.Provider>
	);
};

Metabox.propTypes = {
	className: PT.string,
	wcf: PT.object,
	group_level: PT.number,
};

export default Metabox;
