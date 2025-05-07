import { Button as ButtonComponent } from '@/components/Button';
import { addFilter, doAction } from '@wordpress/hooks';
import { useCallback } from 'react';
import clsx from 'clsx';

export function Button (props) {
  const {
    title,
    id,
    url,
    href = url,
    action,
    primary = false,
    disabled = false,
    attributes = {},
    className,
  } = props;

  const handleClick = useCallback(event => {
    if (action) {
      event.preventDefault();
      doAction(action, props);
    }
  }, [action, props]);

  return (
    <ButtonComponent
      primary={primary}
      href={href}
      onClick={handleClick}
      className={clsx('wpifycf-field-button', `wpifycf-field-${id}`, attributes.class, className)}
      disabled={disabled}
      {...attributes}
    >
      {title}
    </ButtonComponent>
  );
}

export default Button;
