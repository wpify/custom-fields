import { addFilter } from '@wordpress/hooks';

export function Mapycz() {
  // TODO
  return 'Mapycz';
}

addFilter('wpifycf_field_mapycz', 'wpify_custom_fields', () => Mapycz);
