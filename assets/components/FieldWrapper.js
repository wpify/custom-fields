import { useContext } from 'react';
import { AppContext } from '@/custom-fields';

export function FieldWrapper ({ renderOptions = {}, children }) {
  const { context } = useContext(AppContext);

  if (renderOptions.noFieldWrapper) {
    return children;
  }

  if (context === 'add_term' && renderOptions.isRoot) {
    return children;
  }

  return (
    <div className="wpifycf-field__wrapper">
      {children}
    </div>
  );
}
