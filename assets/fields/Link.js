import { addFilter } from '@wordpress/hooks';

export function Link() {
  // TODO
  return 'Link';
}

addFilter('wpifycf_field_link', 'wpify_custom_fields', () => Link);
