import { addFilter } from '@wordpress/hooks';

export function Term() {
  // TODO
  return 'Term';
}

addFilter('wpifycf_field_term', 'wpify_custom_fields', () => Term);
