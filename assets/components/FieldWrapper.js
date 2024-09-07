import { Fragment } from 'react';

export function FieldWrapper ({ renderOptions = {}, children }) {
  if (renderOptions.noWrapper === true) {
    return (
      <Fragment>
        {children}
      </Fragment>
    );
  }

  return (
    <div className="wpifycf-field-wrapper">
      {children}
    </div>
  );
}
