import React, { useContext } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import ServerSideRender from '@wordpress/server-side-render';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import ProductOptionsRow from './ProductOptionsRow';
import AppContext from './AppContext';
import ErrorBoundary from './ErrorBoundary';

const GutenbergBlock = (props) => {
	const { attributes, setAttributes, isSelected } = props;
	const data = useContext(AppContext);
	const { items = [], title } = data;

	if (!isSelected) {
		return (
			<ServerSideRender
				block={data.name}
				attributes={{ ...attributes }}
			/>
		)
	}

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: ProductOptionsRow }}>
			<div className={classnames('wcf-block')}>
				<div className={classnames('wcf-block__title')}>
					{title}
				</div>
				{items.map((item) => {
					const Field = getItemComponent(item);

					return Field.noSection ? (
						<ErrorBoundary>
							<Field
								key={item.id}
								{...item}
								onChange={value => setAttributes({ [item.id]: value })}
								value={attributes[item.id]}
							/>
						</ErrorBoundary>
					) : (
						<ProductOptionsRow key={item.id} item={item}>
							<ErrorBoundary>
								<Field
									key={item.id}
									{...item}
									onChange={value => setAttributes({ [item.id]: value })}
									value={attributes[item.id]}
								/>
							</ErrorBoundary>
						</ProductOptionsRow>
					);
				})}
			</div>
		</ScreenContext.Provider>
	);
};

GutenbergBlock.propTypes = {
	className: PT.string,
	wcf: PT.object,
};

export default GutenbergBlock;
