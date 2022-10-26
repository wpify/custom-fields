import React, { useEffect, useState } from 'react';
import ServerSideRender from '@wordpress/server-side-render';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { desktop, edit, Icon } from '@wordpress/icons';
import EditGutenbergBlock from './EditGutenbergBlock';
import InspectorGutenbergBlock from './InspectorGutenbergBlock';
import GutenbergRootWrapper from './GutenbergRootWrapper';
import GutenbergBlockRow from './GutenbergBlockRow';
import ScreenContext from './ScreenContext';

const DESKTOP_VIEW = 'DESKTOP_VIEW';
const EDIT_VIEW = 'EDIT_VIEW';

const GutenbergBlock = (props) => {
	const { appContext, attributes, isSelected } = props;
	const [view, setView] = useState(DESKTOP_VIEW);

	useEffect(() => {
		if (!isSelected && view === EDIT_VIEW) {
			setView(DESKTOP_VIEW);
		}
	}, [isSelected, view]);

	const showViewSwitch = appContext.items.filter(item => item.position !== 'inspector').length > 0;
	const showInspector = appContext.items.filter(item => item.position === 'inspector').length > 0;

	return (
		<ScreenContext.Provider value={{ RootWrapper: GutenbergRootWrapper, RowWrapper: GutenbergBlockRow }}>
			{showViewSwitch && (
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
			)}
			{view === DESKTOP_VIEW && (
				<ServerSideRender
					className="wcf-server-side-rendered"
					block={appContext.name}
					attributes={{ ...attributes }}
					httpMethod="POST"
				/>
			)}
			{view === EDIT_VIEW && (
				<EditGutenbergBlock {...props} />
			)}
			{showInspector && (
				<InspectorGutenbergBlock {...props} />
			)}
		</ScreenContext.Provider>
	);
};

export default GutenbergBlock;
