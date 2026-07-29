import { __, sprintf } from '@wordpress/i18n';

/**
 * Renders the WooCommerce SKU of a product next to its name. Renders nothing
 * for posts without a SKU, which includes every non-product post type.
 */
export function PostSku ({ sku }) {
  if (!sku) {
    return null;
  }

  return (
    <span className="wpifycf-post-sku">
      {sprintf(__('SKU: %s', 'wpify-custom-fields'), sku)}
    </span>
  );
}

export default PostSku;
