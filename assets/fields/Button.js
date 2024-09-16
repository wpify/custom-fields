import { Button as ButtonComponent } from '@/components/Button';
import { doAction } from '@wordpress/hooks';
import { useCallback } from 'react';

export function Button (props) {
  const {
    title,
    href,
    action,
    primary,
    attributes = {},
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
      className="wpifycf-field-button"
      {...attributes}
    >
      {title}
    </ButtonComponent>
  );
}
