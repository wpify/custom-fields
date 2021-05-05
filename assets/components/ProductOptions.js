import React, { useContext } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import ProductOptionsRow from './ProductOptionsRow';
import AppContext from './AppContext';
import ErrorBoundary from './ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

const ProductOptions = () => {
	const data = useContext(AppContext);
	const { items = [] } = data;

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: ProductOptionsRow }}>
			<div className={classnames('options_group')}>
				{items.map((item) => {
					const Field = getItemComponent(item);

					return applyFilters('wcf_field_without_section', false, item.type) ? (
						<ErrorBoundary key={item.id}>
							<Field {...item} />
						</ErrorBoundary>
					) : (
						<ErrorBoundary key={item.id}>
							<ProductOptionsRow item={item}>
								<ErrorBoundary>
									<Field {...item} />
								</ErrorBoundary>
							</ProductOptionsRow>
						</ErrorBoundary>
					);
				})}
			</div>
		</ScreenContext.Provider>
	);
};

ProductOptions.propTypes = {
	className: PT.string,
	wcf: PT.object,
};

export default ProductOptions;
