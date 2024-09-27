import { useCallback, useContext } from 'react';
import { useFields, useValidity } from '@/helpers/hooks';
import { Field } from '@/components/Field';
import { Tabs } from '@/components/Tabs';
import { AppContext } from '@/custom-fields';

export function App ({ integrationId, tabs, form }) {
  const { fields, values, updateValue } = useFields(integrationId);
  const { validity, validate, handleValidityChange } = useValidity({ form });
  const { context } = useContext(AppContext);
  const getRenderOptions = useCallback(context => context === 'options' ? { noWrapper: true } : {}, []);

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
