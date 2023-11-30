import React from 'react';
import { registerBlockType } from '@wordpress/blocks';
import { registerFieldTypes } from './helpers';
import GutenbergBlock from './components/GutenbergBlock';
import { InnerBlocks } from '@wordpress/block-editor';

registerFieldTypes();

window.wcf_blocks = (window.wcf_blocks || {});

Object.keys(window.wcf_blocks).forEach((blockName) => {
	const block = window.wcf_blocks[blockName];

	if (/<svg[^>]*>/gm.test(block.icon)) {
		block.icon = <span dangerouslySetInnerHTML={{ __html: block.icon }}/>;
	}

	block.hooks = {
		name: (name) => name,
		id: (id) => id,
	};

	const save = () => <InnerBlocks.Content />;
	const edit = (props) => <GutenbergBlock appContext={block} {...props} />;

	registerBlockType(block.name, {
		...block,
		apiVersion: 2,
		edit,
		save,
	});
});
