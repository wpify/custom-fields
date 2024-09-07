export function Label ({ label, type, htmlId, renderOptions }) {
  if (renderOptions?.noLabel === true) {
    return null;
  }

  return (
    <label htmlFor={htmlId} className={`wpifycf-label wpifycf-label--${type}`}>
      {label}
    </label>
  );
}
