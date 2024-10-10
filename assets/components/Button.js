import clsx from 'clsx';

export function Button ({ onClick, href, className, children, ...rest }) {
  const Tag = href ? 'a' : 'button';
  const props = {};

  if (href) {
    props.href = href;
    props.target = '_blank';
  } else {
    props.type = 'button';
  }

  return (
    <Tag {...props} {...rest} onClick={onClick} className={clsx('button wpifycf-button', className)}>
      {children}
    </Tag>
  );
}
