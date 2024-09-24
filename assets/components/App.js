import { useCallback, useEffect } from 'react';
import { useFields, useCustomFieldsContext, useConfig, useTab } from '@/helpers/hooks';
import { Field } from '@/components/Field';
import { Tabs } from '@/components/Tabs';

export function App ({ integrationId, context, config, tabs }) {
  const [fields, setFields] = useFields(integrationId);
  const setContext = useCustomFieldsContext(state => state.setContext);
  const setConfig = useConfig(state => state.setConfig);
  const setTab = useTab(state => state.setTab);
  const tab = useTab(state => state.tab);

  useEffect(() => {
    setContext(context);
    setConfig(config);

    if (Object.keys(tabs).length > 0 && !tab) {
      setTab(Object.keys(tabs)[0]);
    }
  }, [context, config, setContext]);

  const getRenderOptions = useCallback(function (context) {
    switch (context) {
      case 'options':
        return {
          noWrapper: true,
          noLabel: true,
        };
      default:
        return {};
    }
  }, []);

  const handleChange = useCallback(function (id) {
    return function (value) {
      setFields(function (prev) {
        const nextFields = [...prev];
        const index = nextFields.findIndex(f => f.id === id);
        nextFields[index] = { ...nextFields[index], value };
        return nextFields;
      });
    };
  }, [setFields]);

  return (
    <>
      <Tabs tabs={tabs} />
      {fields.map(field => (
        <Field
          key={field.id}
          {...field}
          name={field.name || field.id}
          htmlId={field.id}
          onChange={handleChange(field.id)}
          renderOptions={getRenderOptions(context)}
        />
      ))}
    </>
  );
}
