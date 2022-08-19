import React from 'react';
import classnames from 'classnames';

const RootWrapper = ({ className, ...otherProps }) => <div className={classnames('wcf-root-wrapper', className)} {...otherProps} />;

export default RootWrapper;
