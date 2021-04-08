import React from 'react';
import { registerBlockType } from '@wordpress/blocks';
import { registerFieldTypes } from './helpers';
import AppContext from './components/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import GutenbergBlock from './components/GutenbergBlock';

registerFieldTypes();

const edit = ({ attributes, setAttributes }) => {
	return (
		<AppContext.Provider value={attributes.wcf}>
			<ErrorBoundary>
				<GutenbergBlock attributes={attributes} setAttributes={setAttributes} />
			</ErrorBoundary>
		</AppContext.Provider>
	);
};

const save = () => null;

(window.wcf_blocks || []).forEach((block) => {
	registerBlockType(block.name, { ...block, edit, save });
});
