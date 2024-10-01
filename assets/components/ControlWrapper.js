import { useContext } from 'react';
import { AppContext } from '@/custom-fields';

export function ControlWrapper ({ renderOptions = {}, children }) {
  const { context } = useContext(AppContext);

  if (renderOptions.noControlWrapper) {
    return children;
  }

  if (context === 'edit_term' && renderOptions.isRoot) {
    return (
      <td>
        {children}
      </td>
    );
  }

  return children;
}
