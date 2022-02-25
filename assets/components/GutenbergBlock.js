import React, { useEffect, useState } from 'react';
import PT from 'prop-types';
import ServerSideRender from '@wordpress/server-side-render';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { desktop, edit, Icon } from '@wordpress/icons';
import EditGutenbergBlock from './EditGutenbergBlock';
import InspectorGutenbergBlock from './InspectorGutenbergBlock';

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

	console.log(attributes, appContext);

	const showViewSwitch = appContext.items.filter(item => item.position !== 'inspector').length > 0;
	const showInspector = appContext.items.filter(item => item.position === 'inspector').length > 0;

	return (
		<React.Fragment>
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
		</React.Fragment>
	);
};

GutenbergBlock.propTypes = {
	attributes: PT.object,
	setAttributes: PT.func,
	isSelected: PT.bool,
	appContext: PT.object,
};

export default GutenbergBlock;
