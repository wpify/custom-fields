import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import ScreenContext from './ScreenContext';
import GutenbergBlockRow from './GutenbergBlockRow';
import ErrorBoundary from './ErrorBoundary';
import { getItemComponent } from '../helpers';
import { applyFilters } from '@wordpress/hooks';

const EditGutenbergBlock = (props) => {
	const { appContext, attributes, setAttributes } = props;

	const { items = [], title } = appContext;

	return (
		<ScreenContext.Provider value={{ RootWrapper: React.Fragment, RowWrapper: GutenbergBlockRow }}>
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
								appContext={appContext}
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
										appContext={appContext}
									/>
								</ErrorBoundary>
							</GutenbergBlockRow>
						</ErrorBoundary>
					);
				})}
			</div>
		</ScreenContext.Provider>
	);
};

EditGutenbergBlock.propTypes = {
	attributes: PT.object,
	setAttributes: PT.func,
	isSelected: PT.bool,
	appContext: PT.object,
};

export default EditGutenbergBlock;
