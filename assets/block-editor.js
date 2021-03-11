import { registerBlockStyle, unregisterBlockStyle } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

// Block styles

unregisterBlockStyle('core/quote', 'large');

registerBlockStyle('core/paragraph', {
  name: 'wpify-style',
  label: __('WPify style', 'wpify'),
});
