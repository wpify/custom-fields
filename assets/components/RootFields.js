import { Field } from '@/components/Field';

export function RootFields ({
  fields,
  values,
  updateValue,
  renderOptions,
  handleValidityChange,
  validate,
  validity,
}) {
  return fields.map(field => (
    <Field
      key={field.id}
      {...field}
      name={field.name || field.id}
      value={values[field.id]}
      htmlId={field.id.replace(/[\[\]]+/g, '_')}
      onChange={updateValue(field.id)}
      renderOptions={renderOptions}
      setValidity={handleValidityChange(field.id)}
      validity={validate ? validity[field.id] : []}
      fieldPath={field.id}
      setTitle={() => null}
    />
  ));
}
