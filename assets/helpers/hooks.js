import { useCallback, useMemo, useState } from 'react';
import { create } from 'zustand';
import { useEffect } from 'react';
import Sortable from 'sortablejs';

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

export function useSortableList ({ containerRef, draggable, handle, items, setItems }) {
  const onEnd = useCallback((event) => {
    const nextItems = [...items];
    const [movedItem] = nextItems.splice(event.oldIndex, 1);
    nextItems.splice(event.newIndex, 0, movedItem);
    setItems(nextItems);
  }, [items, setItems]);

  useEffect(() => {
    if (containerRef.current) {
      const options = {
        animation: 150,
        onEnd,
      };

      if (draggable) {
        options.draggable = draggable;
      }

      if (handle) {
        options.handle = handle;
      }

      const sortable = Sortable.create(containerRef.current, options);

      return () => {
        sortable.destroy();
      };
    }
  }, [containerRef, onEnd, draggable, handle]);
}

export function useMediaLibrary ({
  value,
  onChange,
  multiple = false,
  title,
  button,
  type,
}) {
  return useCallback(() => {
    const frame = wp.media({
      multiple,
      title,
      button,
      library: {
        type,
      },
    });
    frame
      .on('select', () => {
        let nextValue;

        if (multiple) {
          const attachments = frame.state().get('selection').toJSON();
          nextValue = Array.from(new Set([...value, ...attachments.map((attachment) => attachment.id)]));
        } else {
          const attachment = frame.state().get('selection').first().toJSON();
          nextValue = attachment.id;
        }

        typeof onChange === 'function' && onChange(nextValue);
      })
      .open();
  }, [value, onChange, multiple, title, button, type]);
}
