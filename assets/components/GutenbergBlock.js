import React, { useContext, useState, useEffect } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import ServerSideRender from '@wordpress/server-side-render';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, desktop, edit } from '@wordpress/icons';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import ProductOptionsRow from './ProductOptionsRow';
import AppContext from './AppContext';
import ErrorBoundary from './ErrorBoundary';

const DESKTOP_VIEW = 'DESKTOP_VIEW';
const EDIT_VIEW = 'EDIT_VIEW';

const GutenbergBlock = (props) => {
	const { attributes, setAttributes, isSelected } = props;
	const data = useContext(AppContext);
	const { items = [], title } = data;
	const [view, setView] = useState(DESKTOP_VIEW);

	useEffect(() => {
		if (!isSelected && view === EDIT_VIEW) {
			setView(DESKTOP_VIEW);
		}
	}, [isSelected, view]);

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: ProductOptionsRow }}>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						isActive={view === DESKTOP_VIEW}
						onClick={() => setView(DESKTOP_VIEW)}
					>
						<div className="wcf-block-toolbar-button">
							<Icon icon={desktop} />
							{__('View', 'wpify-custom-fields')}
						</div>
					</ToolbarButton>
					<ToolbarButton
						isActive={view === EDIT_VIEW}
						onClick={() => setView(EDIT_VIEW)}
					>
						<div className="wcf-block-toolbar-button">
							<Icon icon={edit} />
							{__('Edit', 'wpify-custom-fields')}
						</div>
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			{view === DESKTOP_VIEW && (
				<ServerSideRender
					block={data.name}
					attributes={{ ...attributes }}
				/>
			)}
			{view === EDIT_VIEW && (
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
			)}
		</ScreenContext.Provider>
	);
};

GutenbergBlock.propTypes = {
	attributes: PT.object,
	setAttributes: PT.func,
	isSelected: PT.bool,
};

export default GutenbergBlock;
