import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';

const Button = (props) => {
	const { className, ...rest } = props;
  return (
    <button type="button" className={classnames('button', className)} {...rest} />
  );
};

Button.propTypes = {
  className: PT.string,
};

export default Button;
