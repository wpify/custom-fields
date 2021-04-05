import React, { useContext } from 'react';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import MetaboxRow from './MetaboxRow';
import AppContext from './AppContext';
import ErrorBoundary from './ErrorBoundary';

const Metabox = () => {
	const data = useContext(AppContext);
	const { items = [] } = data;

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: MetaboxRow }}>
			{items.map((item) => {
				const Field = getItemComponent(item);

				return Field.noSection ? (
					<ErrorBoundary>
						<Field key={item.id} {...item} />
					</ErrorBoundary>
				) : (
					<MetaboxRow item={item}>
						<ErrorBoundary>
							<Field key={item.id} {...item} />
						</ErrorBoundary>
					</MetaboxRow>
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
