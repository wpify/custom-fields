import { addFilter } from '@wordpress/hooks';

export function Post() {
  // TODO
  return 'Post';
}

addFilter('wpifycf_field_post', 'wpify_custom_fields', () => Post);
