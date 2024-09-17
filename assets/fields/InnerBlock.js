import { addFilter } from '@wordpress/hooks';

function InnerBlocks() {
  // TODO
  return 'InnerBlocks';
}

addFilter('wpifycf_field_inner_blocks', 'wpify_custom_fields', () => InnerBlocks);
