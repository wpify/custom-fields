import React from 'react';
import OptionsRoot from './OptionsRoot';
import OptionsRow from './OptionsRow';
import ScreenContext from './ScreenContext';
import { getItemComponent } from '../helpers';
import ErrorBoundary from './ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const Options = ({ appContext, handleChange }) => {
	const { items = [] } = appContext;

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
								withoutWrapper={applyFilters('wcf_field_without_wrapper', false, item.type)}
								withoutLabel={applyFilters('wcf_field_without_label', false, item.type)}
								withoutSection={applyFilters('wcf_field_without_section', false, item.type)}
							>
								<ErrorBoundary>
									<Field
										{...item}
										appContext={appContext}
										onChange={handleChange(item)}
									/>
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
