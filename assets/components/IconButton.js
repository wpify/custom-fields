import { Icon, trash, chevronUpDown, create, edit, copy, bug, plus } from '@wordpress/icons';
import clsx from 'clsx';

const icons = {
  trash,
  move: chevronUpDown,
  duplicate: copy,
  edit,
  plus,
};

export function IconButton ({ onClick, href, className, icon, style = 'light', size = 20 }) {
  const Tag = href ? 'a' : 'button';
  const props = {};

  if (href) {
    props.href = href;
    props.target = '_blank';
  } else {
    props.type = 'button';
  }

  const resolvedIcon = icons[icon] || bug;

  return (
    <Tag
      {...props}
      onClick={onClick}
      className={clsx('wpifycf-icon-button', `wpifycf-icon-button--${style}`, `wpifycf-icon-button--${icon}`, className)}
    >
      <Icon icon={resolvedIcon} size={size} />
    </Tag>
  );
}
