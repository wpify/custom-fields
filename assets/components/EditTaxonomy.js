import React from 'react';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import EditTaxonomyRow from './EditTaxonomyRow';

const EditTaxonomy = (props) => {
	const { group_level = 0, wcf = {} } = props;
	const { items = [] } = wcf;

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: EditTaxonomyRow }}>
			{items.map((item) => {
				const Field = getItemComponent(item);

				if (Field.renderWrapper && !Field.renderWrapper(group_level)) {
					return (
						<Field {...item} group_level={group_level}/>
					);
				}

				return (
					<EditTaxonomyRow key={item.id} item={item} group_level={group_level}>
						<Field {...item} group_level={group_level} />
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
