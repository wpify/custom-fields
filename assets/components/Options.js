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

					if (!Field) {
						return null;
					}

					return (
						<ErrorBoundary key={item.id}>
							<OptionsRow
								item={item}
								withoutWrapper={Field.withoutWrapper && Field.withoutWrapper()}
								withoutLabel={Field.noLabel}
								withoutSection={Field.noSection}
							>
								<ErrorBoundary>
									<Field {...item}/>
								</ErrorBoundary>
							</OptionsRow>
						</ErrorBoundary>
					);
				})}
			</OptionsRoot>
		</ScreenContext.Provider>
	);
};

export default Options;
