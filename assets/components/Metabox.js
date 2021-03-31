import React from 'react';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import MetaboxRow from './MetaboxRow';

const Metabox = (props) => {
	const { wcf: { items = [] }, group_level } = props;

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: MetaboxRow }}>
			{items.map((item) => {
				const Field = getItemComponent(item);

				return Field.noSection ? (
					<Field key={item.id} {...item} group_level={group_level} />
				) : (
					<MetaboxRow item={item} group_level={group_level}>
						<Field key={item.id} {...item} group_level={group_level} />
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
