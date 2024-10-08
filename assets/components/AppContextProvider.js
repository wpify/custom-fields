import { useCallback, useMemo, useState } from 'react';
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

  return (
    <AppContext.Provider
      value={{
        context,
        config,
        tabs,
        fields,
        values,
        updateValue,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
