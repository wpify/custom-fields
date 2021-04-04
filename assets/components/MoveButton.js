import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

const Move = ({ className, ...rest }) => {
  return (
		<button
			type="button"
			className={classnames(className, 'wcf-button wcf-button--move')}
			{...rest}
		>
			<svg width={10} height={10} viewBox="0 0 10 10">
				<line stroke="#50575e" strokeWidth={2} x1={2} y1={0} x2={2} y2={10} />
				<line stroke="#50575e" strokeWidth={2} x1={6} y1={0} x2={6} y2={10} />
			</svg>
		</button>
	);
};

Move.propTypes = {
  className: PT.string,
};

export default Move;
