import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppContext } from '@/custom-fields';

export function AppContextProvider ({ context, config, tabs, integrationId, children }) {
  const defs = useMemo(
    () => {
      const nodes = integrationId
        ? Array.from(document.querySelectorAll('.wpifycf-field[data-integration-id="' + integrationId + '"]'))
        : [];

      return nodes.map(node => {
        const dataset = { ...JSON.parse(node.dataset.item), node };

        if (dataset.loop || dataset.loop === 0) {
          dataset.id = `${dataset.id}[${dataset.loop}]`;
          dataset.name = `${dataset.name}[${dataset.loop}]`;
        }

        return dataset;
      });
    },
    [integrationId],
  );

  const fields = useMemo(() => defs.map(({ value, ...props }) => props), [defs]);

  const [values, setValues] = useState(() => defs.reduce((acc, { id, value }) => ({ ...acc, [id]: value }), {}));

  const updateValue = useCallback(id => value => setValues(values => ({ ...values, [id]: value })), []);

  const [currentTab, setCurrentTab] = useState(() => {
    let tab = null;

    if (context !== 'gutenberg') {
      const searchParams = new URLSearchParams(window.location.hash.slice(1));
      tab = searchParams.get('tab');
    }

    if (
      (!tab && Object.keys(tabs).length > 0) ||
      (tab && !tabs[tab])
    ) {
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

  return (
    <AppContext.Provider
      value={{
        context,
        config,
        tabs,
        fields,
        values,
        updateValue,
        currentTab,
        setTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
