import React from 'react';
import { registerBlockType } from '@wordpress/blocks';
import { registerFieldTypes } from './helpers';
import AppContext from './components/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import GutenbergBlock from './components/GutenbergBlock';

registerFieldTypes();

const edit = (wcf) => (props) => {
	return (
		<AppContext.Provider value={wcf}>
			<ErrorBoundary>
				<GutenbergBlock {...props} />
			</ErrorBoundary>
		</AppContext.Provider>
	);
};

const save = () => null;
const blocks = (window.wcf_blocks || {});

Object.keys(blocks).forEach((blockName) => {
	const block = blocks[blockName];

	if (/<svg[^>]*>/gm.test(block.icon)) {
		block.icon = <span dangerouslySetInnerHTML={{ __html: block.icon }} />
	}

	registerBlockType(block.name, { ...block, edit: edit(block), save });
});
