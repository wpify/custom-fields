import React from 'react';
import classnames from 'classnames';

const Button = (props) => {
	const { className, ...rest } = props;
  return (
    <button type="button" className={classnames('button', className)} {...rest} />
  );
};

export default Button;
