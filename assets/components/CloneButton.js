import React from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

const CloneButton = (props) => {
	const { className, ...rest } = props;
  return (
		<button
			type="button"
			className={classnames(className, 'wcf-button wcf-button--clone')}
			{...rest}
		>
			<svg width={10} height={10} viewBox="0 0 10 10">
				<path stroke="#50575e" d="M 9.098 0.48 L 3.89 0.48 C 3.668 0.48 3.489 0.659 3.489 0.879 L 3.489 6.074 C 3.489 6.295 3.668 6.474 3.89 6.474 L 9.098 6.474 C 9.32 6.474 9.499 6.295 9.499 6.074 L 9.499 0.879 C 9.499 0.659 9.32 0.48 9.098 0.48 Z M 8.965 5.942 L 4.022 5.942 L 4.022 1.013 L 8.965 1.013 L 8.965 5.942 Z" />
				<path stroke="#50575e" d="M 5.475 8.987 L 0.993 8.987 L 0.993 4.567 L 1.84 4.567 L 1.84 4.088 L 0.872 4.088 C 0.672 4.088 0.508 4.249 0.508 4.447 L 0.508 9.106 C 0.508 9.304 0.672 9.465 0.872 9.465 L 5.595 9.465 C 5.796 9.465 5.959 9.304 5.959 9.106 L 5.959 8.15 L 5.475 8.15 L 5.475 8.987 Z" />
			</svg>
		</button>
	);
};

CloneButton.propTypes = {
  className: PT.string,
};

export default CloneButton;
