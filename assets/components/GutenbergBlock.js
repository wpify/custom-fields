import React, { useContext, useEffect, useState } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import ServerSideRender from '@wordpress/server-side-render';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { desktop, edit, Icon } from '@wordpress/icons';
import { getItemComponent } from '../helpers';
import ScreenContext from './ScreenContext';
import GutenbergBlockRow from './GutenbergBlockRow';
import AppContext from './AppContext';
import ErrorBoundary from './ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';

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
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: GutenbergBlockRow }}>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						isActive={view === DESKTOP_VIEW}
						onClick={() => setView(DESKTOP_VIEW)}
					>
						<div className="wcf-block-toolbar-button">
							<Icon icon={desktop}/>
							{__('View', 'wpify-custom-fields')}
						</div>
					</ToolbarButton>
					<ToolbarButton
						isActive={view === EDIT_VIEW}
						onClick={() => setView(EDIT_VIEW)}
					>
						<div className="wcf-block-toolbar-button">
							<Icon icon={edit}/>
							{__('Edit', 'wpify-custom-fields')}
						</div>
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			{view === DESKTOP_VIEW && (
				<ServerSideRender
					block={data.name}
					attributes={{ ...attributes }}
					httpMethod="POST"
				/>
			)}
			{view === EDIT_VIEW && (
				<div className={classnames('wcf-block')}>
					<ErrorBoundary>
						<div className={classnames('wcf-block__title')} dangerouslySetInnerHTML={{ __html: title }}/>
					</ErrorBoundary>
					{items.map((item) => {
						const Field = getItemComponent(item);

						return applyFilters('wcf_field_without_section', false, item.type) ? (
							<ErrorBoundary key={item.id}>
								<Field
									{...item}
									onChange={value => setAttributes({ [item.id]: value })}
									value={attributes[item.id]}
								/>
							</ErrorBoundary>
						) : (
							<ErrorBoundary key={item.id}>
								<GutenbergBlockRow item={item}>
									<ErrorBoundary>
										<Field
											{...item}
											onChange={value => setAttributes({ [item.id]: value })}
											value={attributes[item.id]}
										/>
									</ErrorBoundary>
								</GutenbergBlockRow>
							</ErrorBoundary>
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
