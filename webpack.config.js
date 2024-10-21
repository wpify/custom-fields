const default_config = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
  ...default_config,
  entry: {
    'wpify-custom-fields': './assets/custom-fields.js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'assets'),
      'npm': path.resolve(__dirname, 'node_modules'),
    },
  },
};
