import { addFilter } from '@wordpress/hooks';

function Title() {
  // TODO
  return 'Title';
}

addFilter('wpifycf_field_title', 'wpify_custom_fields', () => Title);
