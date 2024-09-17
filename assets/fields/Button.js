import { Button as ButtonComponent } from '@/components/Button';
import { addFilter, doAction } from '@wordpress/hooks';
import { useCallback } from 'react';
import clsx from 'clsx';

export function Button (props) {
  const {
    title,
    id,
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
      className={clsx('wpifycf-field-button', `wpifycf-field-${id}`, attributes.class)}
      {...attributes}
    >
      {title}
    </ButtonComponent>
  );
}

addFilter('wpifycf_field_button', 'wpify_custom_fields', () => Button);
