import { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export const Label = forwardRef(function ({ label, type, htmlId, renderOptions, className, required }, ref) {
  if (renderOptions?.noLabel === true) {
    return null;
  }

  return (
    <label htmlFor={htmlId} className={clsx(`wpifycf-label wpifycf-label--${type}`, className)} ref={ref}>
      {label}
      {required && <span className="wpifycf-field__required">*</span>}
    </label>
  );
});

export function OptionsLabel ({ node, ...props }) {
  const label = <Label {...props} />;
  const th = node?.closest('tr')?.querySelector('th[scope="row"]');

  if (th) {
    return createPortal(label, th);
  }

  return label;
}
