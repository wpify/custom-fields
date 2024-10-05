import { useMemo, useContext } from 'react';
import { useFields, useValidity } from '@/helpers/hooks';
import { AppContext } from '@/custom-fields';
import { RootFields } from '@/components/RootFields';

export function App ({ integrationId, tabs, form }) {
  const { fields, values, updateValue } = useFields(integrationId);
  const { validity, validate, handleValidityChange } = useValidity({ form });
  const { context } = useContext(AppContext);

  const renderOptions = useMemo(() => ({
    noFieldWrapper: ['options', 'edit_term'].includes(context),
    noControlWrapper: false,
    isRoot: true,
  }), [context]);

  return (
    <RootFields
      tabs={tabs}
      fields={fields}
      values={values}
      updateValue={updateValue}
      renderOptions={renderOptions}
      handleValidityChange={handleValidityChange}
      validate={validate}
      validity={validity}
    />
  );
}
