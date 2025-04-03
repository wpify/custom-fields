import { createContext, useCallback, useEffect, useState } from 'react';

export const AppContext = createContext({});

export function AppContextProvider ({
  context,
  config,
  tabs,
  fields,
  values: passedValues,
  updateValue: passedUpdateValue,
  initialValues = {},
  children,
}) {
  const [values, setValues] = useState(initialValues);
  const updateValue = useCallback(id => value => setValues(values => ({ ...values, [id]: value })), []);

  const [currentTab, setCurrentTab] = useState(() => {
    let tab = '';

    if (context !== 'gutenberg') {
      const searchParams = new URLSearchParams(window.location.hash.slice(1));
      tab = searchParams.get('tab');
    }

    if ((!tab && Object.keys(tabs).length > 0) || (tab && !tabs[tab])) {
      tab = Object.keys(tabs)[0];
    }

    return tab;
  });

  const setTab = useCallback(tab => {
    setCurrentTab(tab);

    if (context !== 'gutenberg') {
      const searchParams = new URLSearchParams(window.location.hash.slice(1));
      searchParams.set('tab', tab);
      window.location.hash = searchParams.toString();
    }
  }, [setCurrentTab]);

  const updateTabFromHash = useCallback(() => {
    const searchParams = new URLSearchParams(window.location.hash.slice(1));
    const hashTab = searchParams.get('tab');
    if (hashTab && hashTab !== currentTab) {
      setCurrentTab(hashTab);
    }
  }, [currentTab]);

  useEffect(() => {
    if (context !== 'gutenberg') {
      window.addEventListener('hashchange', updateTabFromHash);
      updateTabFromHash();
    }

    return () => {
      if (context !== 'gutenberg') {
        window.removeEventListener('hashchange', updateTabFromHash);
      }
    };
  }, [context, updateTabFromHash]);

  const usedValues = passedValues || values;
  const usedUpdateValue = passedUpdateValue || updateValue;

  return (
    <AppContext.Provider
      value={{
        context,
        config,
        tabs,
        fields,
        values: usedValues,
        updateValue: usedUpdateValue,
        currentTab,
        setTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
