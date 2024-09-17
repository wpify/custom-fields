import clsx from 'clsx';
import { Button } from '@/fields/Button';
import { addFilter } from '@wordpress/hooks';

function MultiButton ({ className, buttons = [] }) {
  return (
    <span className={clsx('wpifycf-field-multi-button', className)}>
      {buttons.map((button, index) => (
        <Button
          key={index}
          {...button}
        />
      ))}
    </span>
  );
}

addFilter('wpifycf_field_multi_button', 'wpify_custom_fields', () => MultiButton);
