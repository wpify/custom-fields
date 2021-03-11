module.exports = {
  config: {
    build: 'build',
    entry: {
      'plugin': './assets/plugin.jsx',
      'home': './assets/home.scss',
      'some-module': './assets/some-module.scss',
      'block-editor': './assets/block-editor.js',
      'editor-style': './assets/editor-style.scss',
      'button': './assets/button.scss',
      'test-block-backend': './assets/blocks/test-block.jsx',
      'test-block-frontend': './assets/blocks/test-block-frontend.scss',
    },
  },
  webpack: (config) => {
    return config;
  },
  browserSync: (config) => {
    return config;
  },
  copy: {
    'editor-style.css': 'themes/main/editor-style.css',
  },
};
