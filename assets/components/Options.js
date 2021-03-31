import React from 'react';
import PT from 'prop-types';
import OptionsRoot from './OptionsRoot';
import OptionsRow from './OptionsRow';
import ScreenContext from './ScreenContext';
import { getItemComponent } from '../helpers';

const Options = (props) => {
	const { wcf: { items = [] }, className, group_level = 0 } = props;

	return (
		<ScreenContext.Provider value={{ RootWrapper: OptionsRoot, RowWrapper: OptionsRow }}>
			<OptionsRoot className={className} group_level={group_level}>
				{items.map(item => {
					const Field = getItemComponent(item);

					if (Field.renderWrapper && !Field.renderWrapper(group_level)) {
						return (
							<Field {...item} group_level={group_level}/>
						);
					}

					return (
						<OptionsRow key={item.id} item={item} group_level={group_level}>
							<Field {...item} group_level={group_level}/>
						</OptionsRow>
					);
				})}
			</OptionsRoot>
		</ScreenContext.Provider>
	);
};

Options.propTypes = {
	className: PT.string,
	wcf: PT.object,
	group_level: PT.number,
};

export default Options;
