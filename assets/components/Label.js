import clsx from 'clsx';
import { useContext } from 'react';
import { AppContext } from '@/components/AppContext';;
import { maybePortal } from '@/helpers/functions';
import { ErrorBoundary } from 'react-error-boundary'
import { RawHTML } from '@/components/RawHTML'

export function Label ({
  node,
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

  const { context } = useContext(AppContext);

  const markup = (
    <label
      htmlFor={htmlId}
      className={clsx(`wpifycf-field__label wpifycf-field__label--${type}`, className, validity.length && 'wpifycf-field__label--invalid')}
    >
      <RawHTML html={label} />
      {required && <span className="wpifycf-field__required">*</span>}
    </label>
  );

  if (['options', 'site-options', 'user'].includes(context) && node) {
    return maybePortal(markup, node.closest('tr')?.querySelector('th'));
  }

  if (context === 'edit_term' && renderOptions.isRoot) {
    return (
      <th scope="row">
        {markup}
      </th>
    );
  }

  return markup;
}
