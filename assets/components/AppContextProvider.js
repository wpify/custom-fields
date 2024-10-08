import { useCallback, useState } from 'react';
import { AppContext } from '@/custom-fields';

export function AppContextProvider ({ context, config, tabs, children }) {
  const [values, setValues] = useState({});
  const updateValue = useCallback(id => value => setValues(values => ({ ...values, [id]: value })), []);

  return (
    <AppContext.Provider
      value={{
        context,
        config,
        tabs,
        values,
        setValues,
        updateValue,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
