import { addFilter } from '@wordpress/hooks';

function Toggle() {
  // TODO
  return 'Toggle';
}

addFilter('wpifycf_field_toggle', 'wpify_custom_fields', () => Toggle);
