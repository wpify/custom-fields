import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { InnerBlocks } from '@wordpress/block-editor';
import { applyFilters } from '@wordpress/hooks';

const InnerBlocksField = React.forwardRef((rawProps, ref) => {
	const props = applyFilters('wcf_field_props', rawProps);
	const {
		id,
		htmlId = id => id,
		description,
		group_level = 0,
		className,
		allowed_blocks,
		template,
		template_lock,
		orientation,
	} = props;

	if (group_level > 0) {
		return null;
	}

	return (
		<React.Fragment>
			<div className={className} id={htmlId(id)} ref={ref}>
				<InnerBlocks
					allowedBlocks={allowed_blocks}
					template={template}
					orientation={orientation}
					templateLock={template_lock}
				/>
			</div>
			{description && (
				<ErrorBoundary>
					<p className="description" dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
		</React.Fragment>
	);
});

export default InnerBlocksField;
