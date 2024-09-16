import clsx from 'clsx';
import { Button } from '@/fields/Button';

export function MultiButton ({ className, buttons = [] }) {
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
