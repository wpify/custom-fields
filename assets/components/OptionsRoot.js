import classnames from 'classnames';
import PT from 'prop-types';
import React from 'react';
import ErrorBoundary from './ErrorBoundary';

const OptionsRoot = (props) => {
	const { className, children, group_level = 0 } = props;

	if (group_level === 0) {
		return (
			<table className={classnames('form-table', className)} role="presentation" style={{ tableLayout: 'auto' }}>
				<tbody>
					<ErrorBoundary>
						{children}
					</ErrorBoundary>
				</tbody>
			</table>
		);
	}

	return (
		<ErrorBoundary>
			{children}
		</ErrorBoundary>
	);
};

OptionsRoot.propTypes = {
	className: PT.string,
	children: PT.element,
	group_level: PT.number,
};

export default OptionsRoot;
