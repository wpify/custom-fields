import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import GutenbergBlockRow from './GutenbergBlockRow';
import ErrorBoundary from './ErrorBoundary';
import { getItemComponent } from '../helpers';
import { applyFilters } from '@wordpress/hooks';

const EditGutenbergBlock = (props) => {
	const { appContext, attributes, setAttributes } = props;
	const [initialAttributes] = useState(attributes);
	const originalWcf = appContext;

	const wcf = useMemo(() => {
		const newWcf = applyFilters('wcf_definition', originalWcf, attributes);

		if (JSON.stringify(newWcf) !== JSON.stringify(originalWcf)) {
			return newWcf;
		}

		return originalWcf;
	}, [applyFilters, originalWcf, attributes]);

	const { items = [], title } = wcf;

	const handleChange = (item) => (value) => {
		setAttributes(applyFilters('wcf_set_block_attribute', { [item.id]: value }, item, attributes, initialAttributes));
	};

	return (
		<div className={classnames('wcf-block')}>
			<ErrorBoundary>
				<div className={classnames('wcf-block__title')} dangerouslySetInnerHTML={{ __html: title }}/>
			</ErrorBoundary>
			{items.filter(item => item.position !== 'inspector').map((item) => {
				const Field = getItemComponent(item);
				return applyFilters('wcf_field_without_section', false, item.type) ? (
					<ErrorBoundary key={item.id}>
						<Field
							{...item}
							onChange={handleChange(item)}
							value={attributes[item.id]}
							appContext={wcf}
						/>
					</ErrorBoundary>
				) : (
					<ErrorBoundary key={item.id}>
						<GutenbergBlockRow item={item}>
							<ErrorBoundary>
								<Field
									{...item}
									onChange={handleChange(item)}
									value={attributes[item.id]}
									appContext={wcf}
								/>
							</ErrorBoundary>
						</GutenbergBlockRow>
					</ErrorBoundary>
				);
			})}
		</div>
	);
};

EditGutenbergBlock.propTypes = {
	attributes: PT.object,
	setAttributes: PT.func,
	isSelected: PT.bool,
	appContext: PT.object,
};

export default EditGutenbergBlock;
