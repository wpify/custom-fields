export function ControlWrapper ({ renderOptions = {}, children }) {
  if (renderOptions.noControlWrapper) {
    return children;
  }

  return (
    <div className="wpifycf-field__control">
      {children}
    </div>
  );
}
