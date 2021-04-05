import React, { useContext } from 'react';
import OptionsRoot from './OptionsRoot';
import OptionsRow from './OptionsRow';
import ScreenContext from './ScreenContext';
import { getItemComponent } from '../helpers';
import AppContext from './AppContext';
import ErrorBoundary from './ErrorBoundary';

const Options = () => {
	const data = useContext(AppContext);
	const { items = [] } = data;

	return (
		<ScreenContext.Provider value={{ RootWrapper: OptionsRoot, RowWrapper: OptionsRow }}>
			<OptionsRoot>
				{items.map(item => {
					const Field = getItemComponent(item);

					if (Field.withoutWrapper && Field.withoutWrapper()) {
						return (
							<ErrorBoundary>
								<Field {...item} />
							</ErrorBoundary>
						);
					}

					return (
						<OptionsRow key={item.id} item={item}>
							<ErrorBoundary>
								<Field {...item}/>
							</ErrorBoundary>
						</OptionsRow>
					);
				})}
			</OptionsRoot>
		</ScreenContext.Provider>
	);
};

export default Options;
