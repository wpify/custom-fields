import clsx from 'clsx';

export function Label ({ label, type, htmlId, renderOptions, className }) {
  if (renderOptions?.noLabel === true) {
    return null;
  }

  return (
    <label htmlFor={htmlId} className={clsx(`wpifycf-label wpifycf-label--${type}`, className)}>
      {label}
    </label>
  );
}
