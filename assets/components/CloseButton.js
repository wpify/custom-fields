import React from 'react';
import classnames from 'classnames';

const CloseButton = (props) => {
	const { className, ...rest } = props;
  return (
		<button
			type="button"
			className={classnames(className, 'wcf-button wcf-button--delete')}
			{...rest}
		>
			<svg width={10} height={10} viewBox="0 0 10 10">
				<line stroke="currentColor" strokeWidth={2} x1={1} y1={9} x2={9} y2={1} />
				<line stroke="currentColor" strokeWidth={2} x1={1} y1={1} x2={9} y2={9} />
			</svg>
		</button>
	);
};

export default CloseButton;
