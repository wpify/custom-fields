module.exports = {
  config: {
    build: 'build',
    entry: {
			'wpify-custom-fields': [
				'./assets/wpify-custom-fields.js',
				'./assets/wpify-custom-fields.scss',
			],
			'wpify-custom-blocks': [
				'./assets/wpify-custom-blocks.js',
				'./assets/wpify-custom-fields.scss',
			],
    },
  },
};
