import { addFilter } from '@wordpress/hooks';

export function Wysiwyg() {
  // TODO
  return 'Wysiwyg';
}

addFilter('wpifycf_field_wysiwyg', 'wpify_custom_fields', () => Wysiwyg);
