export function FieldWrapper ({ renderOptions = {}, children }) {
  if (renderOptions.noFieldWrapper) {
    return children
  }

  return (
    <span className="wpifycf-field__wrapper">
      {children}
    </span>
  );
}
