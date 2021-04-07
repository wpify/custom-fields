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
				<line stroke="#50575e" strokeWidth={2} x1={0} y1={1} x2={10} y2={1} />
				<line stroke="#50575e" strokeWidth={2} x1={0} y1={5} x2={10} y2={5} />
				<line stroke="#50575e" strokeWidth={2} x1={0} y1={9} x2={10} y2={9} />
			</svg>
		</button>
	);
};

Move.propTypes = {
  className: PT.string,
};

export default Move;
