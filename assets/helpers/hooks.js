import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { create } from 'zustand';
import Sortable from 'sortablejs';
import { v4 as uuidv4 } from 'uuid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/helpers/api.js';
import { useSelect } from '@wordpress/data';
import '@wordpress/core-data';

export function useFields (integrationId) {
  const initialFields = useMemo(function () {
    const containers = document.querySelectorAll('.wpifycf-field[data-integration-id="' + integrationId + '"]');
    const fields = [];

    containers.forEach(function (container) {
      try {
        const props = JSON.parse(container.dataset.props);
        fields.push({
          ...props,
          node: container,
        });
      } catch (error) {
        console.error(error);
        return null;
      }
    });

    return fields;
  }, [integrationId]);

  const [fields, setFields] = useState(initialFields);

  return [fields, setFields];
}

export const useCustomFieldsContext = create((set) => ({
  context: 'default',
  setContext: (context) => set(() => ({ context })),
}));

export const useConfig = create((set) => ({
  config: {},
  setConfig: (config) => set(() => ({ config })),
}));

export const useTab = create((set) => ({
  tab: '',
  setTab: tab => set(() => ({ tab })),
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
    const config = {
      multiple,
      title,
    };

    if (type) {
      config.library = { type };
    }

    if (button) {
      config.button = { text: button };
    }

    const frame = wp.media(config);
    frame
      .on('select', () => {
        let nextValue;

        if (multiple) {
          const attachments = frame.state().get('selection').toJSON();
          nextValue = Array.from(new Set([...attachments.map((attachment) => attachment.id), ...value]));
        } else {
          const attachment = frame.state().get('selection').first().toJSON();
          nextValue = attachment.id;
        }

        typeof onChange === 'function' && onChange(nextValue);
      })
      .open();
  }, [value, onChange, multiple, title, button, type]);
}

export function useAttachment (id) {
  const [attachment, setAttachment] = useState(null);

  useEffect(function () {
    id && wp.media.attachment(id).fetch().then(setAttachment);
  }, [id]);

  return { attachment, setAttachment };
}

export function useMulti ({ value, onChange, min, max, defaultValue, disabled_buttons = [], dragHandle }) {
  const containerRef = useRef(null);
  const [keyPrefix, setKeyPrefix] = useState(uuidv4());
  const [collapsed, setCollapsed] = useState(() => Array(value.length).fill(true));

  useEffect(() => {
    if (!Array.isArray(value)) {
      onChange([]);
    }
  }, []);

  // Update collapsed states when value changes
  useEffect(() => {
    setCollapsed((prevCollapsed) => {
      const newCollapsed = [];
      for (let i = 0; i < value.length; i++) {
        newCollapsed[i] = prevCollapsed[i] !== undefined ? prevCollapsed[i] : false;
      }
      return newCollapsed;
    });
  }, [value]);

  const add = useCallback(() => {
    onChange([...value, defaultValue]);
    setCollapsed((prevCollapsed) => [...prevCollapsed, false]);
  }, [value, defaultValue, onChange]);

  const remove = useCallback(
    (index) => () => {
      if (Array.isArray(value)) {
        const nextValues = [...value];
        nextValues.splice(index, 1);
        onChange(nextValues);

        setCollapsed((prevCollapsed) => {
          const nextCollapsed = [...prevCollapsed];
          nextCollapsed.splice(index, 1);
          return nextCollapsed;
        });
      } else {
        onChange([]);
        setCollapsed([]);
      }
    },
    [value, onChange],
  );

  const duplicate = useCallback(
    (index) => () => {
      const nextValues = [...value];
      nextValues.splice(index, 0, nextValues[index]);
      onChange(nextValues);

      setCollapsed((prevCollapsed) => {
        const nextCollapsed = [...prevCollapsed];
        nextCollapsed.splice(index + 1, 0, false);
        return nextCollapsed;
      });
    },
    [onChange, value],
  );

  const handleChange = useCallback(
    (index) => (fieldValue) => {
      const nextValues = [...value];
      nextValues[index] = fieldValue;
      onChange(nextValues);
    },
    [value, onChange],
  );

  const handleSort = useCallback(
    (nextValue) => {
      setKeyPrefix(uuidv4());
      onChange(nextValue);

      // Reorder the collapsed array to match the new order
      setCollapsed((prevCollapsed) => {
        return nextValue.map((_, newIndex) => {
          const oldIndex = value.findIndex((item) => item === nextValue[newIndex]);
          return prevCollapsed[oldIndex];
        });
      });
    },
    [onChange, value],
  );

  useSortableList({
    containerRef,
    items: value,
    setItems: handleSort,
    handle: dragHandle,
  });

  useEffect(() => {
    if (min !== undefined && value.length < min) {
      const itemsToAdd = Array(min - value.length).fill(defaultValue);
      onChange([...value, ...itemsToAdd]);
      setCollapsed((prevCollapsed) => [...prevCollapsed, ...itemsToAdd.map(() => false)]);
    }

    if (max !== undefined && value.length > max) {
      onChange(value.slice(0, max));
      setCollapsed((prevCollapsed) => prevCollapsed.slice(0, max));
    }
  }, [onChange, value, min, max, defaultValue]);

  const length = value.length;
  const canAdd = !disabled_buttons.includes('move') && (typeof max === 'undefined' || length < max);
  const canRemove = !disabled_buttons.includes('delete') && (typeof min === 'undefined' || length > min);
  const canMove = !disabled_buttons.includes('move') && length > 1;
  const canDuplicate = !disabled_buttons.includes('duplicate');

  const toggleCollapsed = useCallback((index, forceCollapsed = null) => () => {
    setCollapsed((prevCollapsed) => {
      const nextCollapsed = [...prevCollapsed];
      if (forceCollapsed !== null) {
        nextCollapsed[index] = forceCollapsed;
      } else {
        nextCollapsed[index] = !nextCollapsed[index];
      }
      return nextCollapsed;
    });
  }, []);

  return {
    add,
    remove,
    duplicate,
    handleChange,
    canAdd,
    canRemove,
    canMove,
    canDuplicate,
    containerRef,
    keyPrefix,
    collapsed,
    toggleCollapsed,
  };
}

const defaultQueryOptions = {
  retry: 1,
  retryOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export function useUrlTitle (url) {
  const config = useConfig(state => state.config);
  return useQuery({
    queryKey: ['url-title', url],
    queryFn: () => get(config.api_path + '/url-title', { url }),
    enabled: !!config.api_path && !!url,
    initialData: '',
    ...defaultQueryOptions,
  });
}

export function usePosts ({
  postType,
  select,
  enabled = true,
  initialData = [],
  ...args
}) {
  const config = useConfig(state => state.config);

  return useQuery({
    queryKey: ['posts', postType, args.search, args],
    queryFn: () => get(config.api_path + '/posts', {
      post_type: postType,
      ...args,
    }),
    initialData,
    enabled: enabled && !!postType && !!config.api_path,
    select,
    ...defaultQueryOptions,
  });
}

export function useTerms ({
  taxonomy,
  select,
  enabled = true,
  initialData = [],
  ...args
}) {
  const config = useConfig(state => state.config);

  return useQuery({
    queryKey: ['terms', taxonomy, args],
    queryFn: () => get(config.api_path + '/terms', { taxonomy, ...args }),
    initialData,
    enabled: enabled && !!taxonomy && !!config.api_path,
    select,
    ...defaultQueryOptions,
  });
}

export function usePostTypes (onlyPostTypes) {
  return useSelect(
    (select) => {
      const postTypes = select('core').getPostTypes();

      if (!postTypes) {
        return [];
      }

      return postTypes.filter((postType) => Array.isArray(onlyPostTypes) ? onlyPostTypes.includes(postType.slug) : true);
    },
    [],
  );
}

export function useOptions ({
  optionsKey,
  initialData = [],
  enabled = true,
  select,
  ...args
}) {
  const config = useConfig(state => state.config);

  return useQuery({
    queryKey: ['options', optionsKey, args],
    queryFn: () => get(config.api_path + '/options/' + optionsKey, args),
    initialData,
    enabled: enabled && !!config.api_path && !!optionsKey,
    select,
    ...defaultQueryOptions,
  });
}

export function useMapyCzApiKey () {
  const config = useConfig(state => state.config);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['mapycz-api-key'],
    queryFn: () => get(config.api_path + '/mapycz-api-key'),
    enabled: !!config.api_path,
    ...defaultQueryOptions,
  });

  const mutation = useMutation({
    mutationFn: apiKey => post(config.api_path + '/mapycz-api-key', { api_key: apiKey }),
    mutationKey: ['mapycz-api-key'],
    onSuccess: () => queryClient.invalidateQueries(['mapycz-api-key']),
  });

  const handleUpdate = useCallback(apiKey => mutation.mutate(apiKey), [mutation]);
  const isFetching = query.isLoading || mutation.isPending;
  const isError = query.isError || mutation.isError;
  const isSuccess = query.isSuccess || mutation.isSuccess;
  const isIdle = query.isPending && mutation.isIdle;
  const apiKey = query.data;

  return {
    apiKey,
    isFetching,
    isError,
    isSuccess,
    isIdle,
    handleUpdate,
  };
}

export function useMapyCzSuggestions ({ query, apiKey, limit = 10, lang = 'en' }) {
  return useQuery({
    queryKey: ['mapycz-suggestions', query],
    queryFn: () => get('https://api.mapy.cz/v1/suggest', { limit, query, apiKey, lang }),
    enabled: !!query && !!apiKey,
    initialData: {
      'items': [],
      'locality': [],
    },
    ...defaultQueryOptions,
  });
}

export function useMapyCzReverseGeocode ({ apiKey, lang = 'en', latitude, longitude }) {
  return useQuery({
    queryKey: ['mapycz-reverse-geocode', latitude, longitude],
    queryFn: () => get('https://api.mapy.cz/v1/rgeocode/', { apikey: apiKey, lang, lat: latitude, lon: longitude }),
    enabled: !!apiKey && !!latitude && !!longitude,
    ...defaultQueryOptions,
  });
}

export function useValidity ({ form }) {
  const [validity, setValidity] = useState({});
  const [validate, setValidate] = useState(false);

  const handleValidityChange = useCallback(id => validity =>
      setValidity(
        prev => (JSON.stringify(prev[id]) === JSON.stringify(validity))
          ? prev
          : ({ ...prev, [id]: validity }),
      ),
    [setValidity],
  );

  const handleSubmit = useCallback((event) => {
    if (validity && Object.values(validity).some(v => v.length > 0)) {
      event.preventDefault();
      setValidate(true);
    } else {
      setValidate(false);
    }
  }, [validity, setValidate]);

  useEffect(() => {
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }

    return () => {
      if (form) {
        form.removeEventListener('submit', handleSubmit);
      }
    };
  }, [handleSubmit, form]);

  return {
    validity,
    validate,
    handleValidityChange,
  };
}
