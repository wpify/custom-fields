import { useCallback, useMemo, useRef, useState } from 'react';
import { create } from 'zustand';
import { useEffect } from 'react';
import Sortable from 'sortablejs';
import { v4 as uuidv4 } from 'uuid';

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

export function useMulti({ value, onChange, min, max, defaultValue, disabled_buttons = [] }) {
  const containerRef = useRef(null);
  const [keyPrefix, setKeyPrefix] = useState(uuidv4());

  const add = useCallback(function () {
    onChange([...value, defaultValue]);
  }, [value, defaultValue, onChange]);

  const remove = useCallback(function (index) {
    return function () {
      const nextValues = [...value];
      nextValues.splice(index, 1);
      onChange(nextValues);
    };
  }, [value, onChange]);

  const handleChange = useCallback(function (index) {
    return function (fieldValue) {
      const nextValues = [...value];
      nextValues[index] = fieldValue;
      onChange(nextValues);
    };
  }, [value, onChange]);

  const handleSort = useCallback((nextValue) => {
    setKeyPrefix(uuidv4());
    onChange(nextValue);
  }, [onChange]);

  useSortableList({
    containerRef,
    items: value,
    setItems: handleSort,
    handle: '.wpifycf-sort',
  });

  useEffect(() => {
    if (min !== undefined && value.length < min) {
      onChange([...value, ...Array(min - value.length).fill(defaultValue)]);
    }

    if (max !== undefined && value.length > max) {
      onChange(value.slice(0, max));
    }
  }, [onChange, value, min, max, defaultValue]);

  const length = value.length;
  const canAdd = !disabled_buttons.includes('move') && (typeof max === 'undefined' || length < max);
  const canRemove = !disabled_buttons.includes('delete') && (typeof min === 'undefined' || length > min);
  const canMove = !disabled_buttons.includes('move') && length > 1;

  return { add, remove, handleChange, canAdd, canRemove, canMove, containerRef, keyPrefix };
}
