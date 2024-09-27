import { createPortal } from 'react-dom';
import clsx from 'clsx';

export function Label ({
  label,
  type,
  htmlId,
  renderOptions,
  className,
  required,
  validity = [],
}) {
  if (renderOptions?.noLabel === true) {
    return null;
  }

  return (
    <label
      htmlFor={htmlId}
      className={clsx(`wpifycf-field__label wpifycf-field__label--${type}`, className, validity.length && 'wpifycf-field__label--invalid')}
    >
      {label}
      {required && <span className="wpifycf-field__required">*</span>}
    </label>
  );
}

export function OptionsLabel ({ node, ...props }) {
  const label = <Label {...props} />;
  const th = node?.closest('tr')?.querySelector('th[scope="row"]');

  return th ? createPortal(label, th) : label;
}
