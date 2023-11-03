import React, { useState } from 'react';
import classnames from 'classnames';
import { applyFilters } from '@wordpress/hooks';
import { InspectorControls } from '@wordpress/block-editor';
import { Panel, PanelRow, PanelBody } from '@wordpress/components';
import ScreenContext from './ScreenContext';
import GutenbergBlockRow from './GutenbergBlockRow';
import ErrorBoundary from './ErrorBoundary';
import { getItemComponent } from '../helpers';

const RootWrapper = (props) => {
	return <div {...props} />;
};

const InspectorGutenbergBlock = (props) => {
	const { appContext, attributes, setAttributes } = props;
	const [initialAttributes] = useState(attributes);
	const { items = [] } = appContext;

	const handleChange = (item) => (value) => {
		setAttributes(applyFilters('wcf_set_block_attribute', { [item.id]: value }, item, attributes, initialAttributes));
	};

	return (
		<ScreenContext.Provider value={{ RootWrapper, RowWrapper: GutenbergBlockRow }}>
			<InspectorControls className={classnames('wcf-block')}>
				<Panel header={props.title}>
					<PanelBody>
						{items.filter(item => item.position === 'inspector').map((item) => {
							const Field = getItemComponent(item);
							return applyFilters('wcf_field_without_section', false, item.type) ? (
								<ErrorBoundary key={item.id}>
									<PanelRow>
										<Field
											{...item}
											onChange={handleChange(item)}
											value={attributes[item.id]}
											appContext={appContext}
										/>
									</PanelRow>
								</ErrorBoundary>
							) : (
								<ErrorBoundary key={item.id}>
									<PanelRow>
										<GutenbergBlockRow item={item}>
											<ErrorBoundary>
												<Field
													{...item}
													onChange={handleChange(item)}
													value={attributes[item.id]}
													appContext={appContext}
												/>
											</ErrorBoundary>
										</GutenbergBlockRow>
									</PanelRow>
								</ErrorBoundary>
							);
						})}
					</PanelBody>
				</Panel>
			</InspectorControls>
		</ScreenContext.Provider>
	);
};

export default InspectorGutenbergBlock;
