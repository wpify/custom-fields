import { Tabs } from '@/components/Tabs';
import { Field } from '@/components/Field';

export function RootFields({
  tabs,
  fields,
  values,
  updateValue,
  renderOptions,
  handleValidityChange,
  validate,
  validity,
}) {
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
          renderOptions={renderOptions}
          setValidity={handleValidityChange(field.id)}
          validity={validate ? validity[field.id] : []}
          fieldPath={field.id}
        />
      ))}
    </>
  );
}
