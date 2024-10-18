import { useMemo, useContext } from 'react';
import { useValidity } from '@/helpers/hooks';
import { AppContext } from '@/custom-fields';
import { RootFields } from '@/components/RootFields';
import { Tabs } from '@/components/Tabs';

export function App ({ form }) {
  const { fields, values, updateValue } = useContext(AppContext);
  const { validity, validate, handleValidityChange } = useValidity({ form });
  const { context } = useContext(AppContext);

  const renderOptions = useMemo(() => ({
    noFieldWrapper: ['options', 'edit_term', 'add_term'].includes(context),
    noControlWrapper: false,
    isRoot: true,
  }), [context]);

  return (
    <>
      <Tabs />
      <RootFields
        fields={fields}
        values={values}
        updateValue={updateValue}
        renderOptions={renderOptions}
        handleValidityChange={handleValidityChange}
        validate={validate}
        validity={validity}
      />
    </>
  );
}
