import { addFilter } from '@wordpress/hooks';
import clsx from 'clsx';

function Title ({ title, className }) {
  return (
    <div className={clsx('wpify-field-title', className)}>
      {title && <h2 dangerouslySetInnerHTML={{ __html: title }} />}
    </div>
  );
}

Title.renderOptions = {
  noWrapper: true,
  noLabel: true,
};

addFilter('wpifycf_field_title', 'wpify_custom_fields', () => Title);
