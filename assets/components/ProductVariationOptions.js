import React from 'react';
import classnames from 'classnames';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import ErrorBoundary from './ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';
import RootWrapper from './RootWrapper';
import ProductVariationOptionsRow from './ProductVariationOptionsRow';

const ProductVariationOptions = ({ appContext, handleChange }) => {
	const { items = [] } = appContext;

	return (
		<ScreenContext.Provider value={{ RootWrapper, RowWrapper: ProductVariationOptionsRow }}>
			<div className={classnames('options_group')}>
				{items.map((item) => {
					const Field = getItemComponent(item);

					return applyFilters('wcf_field_without_section', false, item.type) ? (
						<ErrorBoundary key={item.id}>
							<Field {...item} appContext={appContext}/>
						</ErrorBoundary>
					) : (
						<ErrorBoundary key={item.id}>
							<ProductVariationOptionsRow item={item}>
								<ErrorBoundary>
									<Field
										{...item}
										onChange={handleChange(item)}
										appContext={appContext}
									/>
								</ErrorBoundary>
							</ProductVariationOptionsRow>
						</ErrorBoundary>
					);
				})}
			</div>
		</ScreenContext.Provider>
	);
};

export default ProductVariationOptions;
