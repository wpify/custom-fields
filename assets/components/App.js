import { Fragment, useCallback, useEffect } from 'react';
import { useFields, useCustomFieldsContext, useConfig } from '@/helpers/hooks';
import { Field } from '@/components/Field';

export function App ({ integrationId, context, config }) {
  const [fields, setFields] = useFields(integrationId);

  const setContext = useCustomFieldsContext(state => state.setContext);
  const setConfig = useConfig(state => state.setConfig);

  useEffect(() => {
    setContext(context);
    setConfig(config);
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
    <Fragment>
      {fields.map((field, index) => (
        <Field
          key={field.id}
          {...field}
          name={field.name || field.id}
          htmlId={field.id}
          onChange={handleChange(field.id)}
          renderOptions={getRenderOptions(context)}
        />
      ))}
    </Fragment>
  );
}
