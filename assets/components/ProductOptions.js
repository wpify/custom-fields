import React, { useContext } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import ProductOptionsRow from './ProductOptionsRow';
import AppContext from './AppContext';

const Options = () => {
	const data = useContext(AppContext);
	const { items = [] } = data;

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: ProductOptionsRow }}>
			<div className={classnames('options_group')}>
				{items.map((item) => {
					const Field = getItemComponent(item);

					return Field.noSection ? (
						<Field key={item.id} {...item} />
					) : (
						<ProductOptionsRow key={item.id} item={item}>
							<Field {...item} />
						</ProductOptionsRow>
					);
				})}
			</div>
		</ScreenContext.Provider>
	);
};

Options.propTypes = {
	className: PT.string,
	wcf: PT.object,
	group_level: PT.number,
};

export default Options;
