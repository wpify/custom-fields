import { addFilter } from '@wordpress/hooks';

export function Select() {
  // TODO
  return 'Select';
}

addFilter('wpifycf_field_select', 'wpify_custom_fields', () => Select);
