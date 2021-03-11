__webpack_public_path__ = window.wpify.publicPath;

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { __ } from '@wordpress/i18n';
import Example from './components/Example';
import store from './store/root';
import './plugin.scss';

const Plugin = () => {
  return (
    <Provider store={store}>
      <h1>
        {__('This is the root of the application', 'wpify')}
      </h1>
      <Example />
    </Provider>
  );
};

ReactDOM.render(<Plugin />, document.querySelector('#react-root'));
