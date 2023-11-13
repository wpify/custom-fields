import React, { useRef } from 'react';
import classnames from 'classnames';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import ErrorBoundary from './ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';
import RootWrapper from './RootWrapper';
import ProductVariationOptionsRow from './ProductVariationOptionsRow';

const ProductVariationOptions = ({ appContext, handleChange }) => {
	const ref = useRef();
	const { items = [] } = appContext;

	const handleChangeItem = (item) => (value) => {
		handleChange(item)(value);

		// Add class to variation to indicate that it needs to be updated
		ref.current.closest('.woocommerce_variation').classList.add('variation-needs-update');
		document.querySelectorAll('#variable_product_options .toolbar button').forEach((button) => {
			button.disabled = false;
		});
	}

	return (
		<ScreenContext.Provider value={{ RootWrapper, RowWrapper: ProductVariationOptionsRow }}>
			<div className={classnames('options_group')} ref={ref}>
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
										onChange={handleChangeItem(item)}
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
