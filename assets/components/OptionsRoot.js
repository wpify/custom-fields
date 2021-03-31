import classnames from 'classnames';
import PT from 'prop-types';
import React from 'react';

const OptionsRoot = (props) => {
	const { className, children, group_level = 0 } = props;

	if (group_level === 0) {
		return (
			<table className={classnames('form-table', className)} role="presentation" style={{ tableLayout: 'auto' }}>
				<tbody>
					{children}
				</tbody>
			</table>
		);
	}

	return children;
};

OptionsRoot.propTypes = {
	className: PT.string,
	children: PT.element,
	group_level: PT.number,
};

export default OptionsRoot;
