import { useMemo, useState } from 'react';
import { create } from 'zustand';

export function useFields (integrationId) {
  const initialFields = useMemo(function () {
    const containers = document.querySelectorAll('.wpifycf-field[data-integration-id="' + integrationId + '"]');
    const fields = [];

    containers.forEach(function (container) {
      const props = JSON.parse(container.dataset.props);
      fields.push({
        ...props,
        node: container,
      });
    });

    return fields;
  }, [integrationId]);

  const [fields, setFields] = useState(initialFields);

  return [fields, setFields];
}

export const useCustomFieldsContext = create((set) => ({
  context: 'default',
  setContext: (context) => set((state) => ({ context })),
}));
