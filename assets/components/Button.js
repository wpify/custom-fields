import clsx from 'clsx';
import { useCallback } from 'react'

export function Button ({
  onClick,
  href,
  className,
  children,
  target,
  primary = false,
  disabled = false,
  ...rest
}) {
  const Tag = href ? 'a' : 'button';
  const props = {};

  if (href) {
    props.href = href;
    props.target = target || '_blank';
  } else {
    props.type = 'button';
  }

  const handleClick = useCallback((event) => {
    if (disabled) {
      event.preventDefault();
    } else {
      onClick(event);
    }
  }, [onClick, disabled]);

  return (
    <Tag
      {...props}
      {...rest}
      onClick={handleClick}
      disabled={disabled}
      className={clsx('wpifycf-button', className, primary && 'wpifycf-button--primary')}
    >
      {children}
    </Tag>
  );
}
