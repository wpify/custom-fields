import React, { useState } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import styles from './Example.module.scss';
import { getAppName, setAppName } from '../store/app';

const Example = ({ name, setAppName }) => {

  const [newAppName, setNewAppName] = useState(name);

  const handleSetNewAppName = (event) => {
    setNewAppName(event.target.value);
  };

  const handleSubmit = (event) => {
    setAppName(newAppName);
    event.preventDefault();
  };

  return (
    <div>
      <h1>
        {name}
      </h1>
      <form className={classnames(styles.form)} onSubmit={handleSubmit}>
        <input
          value={newAppName}
          onChange={handleSetNewAppName}
          className={classnames(styles.input)}
        />
        <button type="submit">
          {__('Change', 'wpify')}
        </button>
      </form>
    </div>
  );
};

Example.propTypes = {
  name: PT.string,
  setAppName: PT.func,
};

const mapStateToProps = (state) => ({
  name: getAppName(state),
});

const mapDispatchToProps = {
  setAppName,
};

export default connect(mapStateToProps, mapDispatchToProps)(Example);
