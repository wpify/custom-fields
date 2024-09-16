import { Icon } from '@wordpress/components';
import clsx from 'clsx';

export function IconButton ({ onClick, href, className, icon, style = 'light', size = 16 }) {
  const Tag = href ? 'a' : 'button';
  const props = {};

  if (href) {
    props.href = href;
    props.target = '_blank';
  } else {
    props.type = 'button';
  }

  return (
    <Tag
      {...props}
      onClick={onClick}
      className={clsx('wpifycf-icon-button', `wpifycf-icon-button--${style}`, className)}
    >
      <Icon icon={icon} size={size} />
    </Tag>
  );
}
