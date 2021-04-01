import React, { useContext } from 'react';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import MetaboxRow from './MetaboxRow';
import AppContext from './AppContext';

const Metabox = () => {
	const data = useContext(AppContext);
	const { items = [] } = data;

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: MetaboxRow }}>
			{items.map((item) => {
				const Field = getItemComponent(item);

				return Field.noSection ? (
					<Field key={item.id} {...item} />
				) : (
					<MetaboxRow item={item}>
						<Field key={item.id} {...item} />
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
