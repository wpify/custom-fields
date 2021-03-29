import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';

const GroupField = ({ className }) => {

  return (
    <div className={classnames(className)}>
			GROUP FIELD!!!
		</div>
  );
};

GroupField.propTypes = {
  className: PT.string,
};

export default GroupField;
