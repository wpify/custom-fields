import clsx from 'clsx';
import { Button } from '@/fields/Button';
import { addFilter } from '@wordpress/hooks';

function MultiButton ({
  className,
  buttons = [],
  disabled = false,
}) {
  return (
    <div className={clsx('wpifycf-field-multi-button', className)}>
      {buttons.map((button, index) => (
        <Button
          key={index}
          disabled={disabled}
          {...button}
        />
      ))}
    </div>
  );
}

export default MultiButton;
