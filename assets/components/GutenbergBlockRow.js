import React from 'react';
import classnames from 'classnames';
import ErrorBoundary from './ErrorBoundary';

const GutenbergBlockRow = (props) => {
	const { className, children, item, htmlId = id => id, style } = props;

  return (
		<div key={item.id} className={classnames('wfc-block-field', `wfc-block-field--${item.type}`, className)} style={style}>
			<ErrorBoundary>
				<label htmlFor={htmlId(item.id)} dangerouslySetInnerHTML={{ __html: item.title }}/>
			</ErrorBoundary>
			<ErrorBoundary>
				{children}
			</ErrorBoundary>
		</div>
  );
};

export default GutenbergBlockRow;
