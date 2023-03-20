import React from 'react';
import classnames from 'classnames';
import ErrorBoundary from './ErrorBoundary';

const ProductVariationOptionsRow = ({ className, children, item, htmlId = id => id, style }) => {
	if (item.title.trim().length === 0) {
		return (
			<ErrorBoundary>
				{children}
			</ErrorBoundary>
		);
	} else {
		return (
			<p className={classnames('form-row form-row-full', className)} style={style}>
				<ErrorBoundary>
					<label htmlFor={htmlId(item.id)} dangerouslySetInnerHTML={{ __html: item.title }} />
				</ErrorBoundary>
				<ErrorBoundary>
					{children}
				</ErrorBoundary>
			</p>
		);
	}
};

export default ProductVariationOptionsRow;
