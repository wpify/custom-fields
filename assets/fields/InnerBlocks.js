import { addFilter } from '@wordpress/hooks';
import { InnerBlocks as InnerBlocksEditor } from '@wordpress/block-editor';
import clsx from 'clsx';

export function InnerBlocks({
  id,
  className,
  allowed_blocks,
  template,
  template_lock,
  orientation,
}) {
  return (
    <div className={clsx('wpifycf-field-inner-blocks', `wpifycf-field-link--${id}`, className)}>
      <InnerBlocksEditor
        allowedBlocks={allowed_blocks}
        template={template}
        orientation={orientation}
        templateLock={template_lock}
      />
    </div>
  );
}

addFilter('wpifycf_field_inner_blocks', 'wpify_custom_fields', () => InnerBlocks);
