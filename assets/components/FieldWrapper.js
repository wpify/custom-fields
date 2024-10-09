export function FieldWrapper ({ renderOptions = {}, children }) {
  if (renderOptions.noFieldWrapper) {
    return children;
  }

  return (
    <div className="wpifycf-field__wrapper">
      {children}
    </div>
  );
}
