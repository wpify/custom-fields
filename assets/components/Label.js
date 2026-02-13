import clsx from 'clsx';
import { RawHTML } from '@/components/RawHTML'

export function Label ({
  label,
  type,
  htmlId,
  renderOptions = {},
  className,
  required,
  validity = [],
}) {
  if (renderOptions.noLabel === true) {
    return null;
  }

  return (
    <label
      htmlFor={htmlId}
      className={clsx(`wpifycf-field__label wpifycf-field__label--${type}`, className, validity.length && 'wpifycf-field__label--invalid')}
    >
      <RawHTML html={label} />
      {required && <span className="wpifycf-field__required">*</span>}
    </label>
  );
}
