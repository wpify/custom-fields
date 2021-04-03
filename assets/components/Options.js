import React, { useContext } from 'react';
import OptionsRoot from './OptionsRoot';
import OptionsRow from './OptionsRow';
import ScreenContext from './ScreenContext';
import { getItemComponent } from '../helpers';
import AppContext from './AppContext';

const Options = () => {
	const data = useContext(AppContext);
	const { items = [] } = data;

	return (
		<ScreenContext.Provider value={{ RootWrapper: OptionsRoot, RowWrapper: OptionsRow }}>
			<OptionsRoot>
				{items.map(item => {
					const Field = getItemComponent(item);

					if (Field.withoutWrapper && Field.withoutWrapper()) {
						return <Field {...item} />;
					}

					return (
						<OptionsRow key={item.id} item={item}>
							<Field {...item}/>
						</OptionsRow>
					);
				})}
			</OptionsRoot>
		</ScreenContext.Provider>
	);
};

export default Options;
