import React, { useContext } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import ProductOptionsRow from './ProductOptionsRow';
import AppContext from './AppContext';
import ErrorBoundary from './ErrorBoundary';

const ProductOptions = () => {
	const data = useContext(AppContext);
	const { items = [] } = data;

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: ProductOptionsRow }}>
			<div className={classnames('options_group')}>
				{items.map((item) => {
					const Field = getItemComponent(item);

					return Field.noSection ? (
						<ErrorBoundary>
							<Field key={item.id} {...item} />
						</ErrorBoundary>
					) : (
						<ProductOptionsRow key={item.id} item={item}>
							<ErrorBoundary>
								<Field {...item} />
							</ErrorBoundary>
						</ProductOptionsRow>
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
