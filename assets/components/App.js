import { useCallback, useEffect } from 'react';
import { useFields, useCustomFieldsContext, useConfig, useTabs, useValidity } from '@/helpers/hooks';
import { Field } from '@/components/Field';
import { Tabs } from '@/components/Tabs';

export function App ({ integrationId, context, config, tabs, form }) {
  const { fields, values, updateValue } = useFields(integrationId);
  const setContext = useCustomFieldsContext(state => state.setContext);
  const setConfig = useConfig(state => state.setConfig);
  const { tab, setTab } = useTabs();
  const { validity, validate, handleValidityChange } = useValidity({ form });

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
        };
      default:
        return {};
    }
  }, []);

  return (
    <>
      <Tabs tabs={tabs} />
      {fields.map(field => (
        <Field
          key={field.id}
          {...field}
          name={field.name || field.id}
          value={values[field.id]}
          htmlId={field.id}
          onChange={updateValue(field.id)}
          renderOptions={getRenderOptions(context)}
          setValidity={handleValidityChange(field.id)}
          validity={validate ? validity[field.id] : []}
          fieldPath={field.id}
        />
      ))}
    </>
  );
}
