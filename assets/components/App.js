import { useMemo, useContext } from 'react';
import { useValidity } from '@/helpers/hooks';
import { AppContext } from '@/custom-fields';
import { RootFields } from '@/components/RootFields';
import { Tabs } from '@/components/Tabs';
import { applyFilters } from '@wordpress/hooks';

export function App ({ form }) {
  const { fields, values, updateValue, context } = useContext(AppContext);
  const { validity, validate, handleValidityChange } = useValidity({ form });

  const renderOptions = useMemo(() => ({
    noFieldWrapper: ['options', 'edit_term', 'add_term'].includes(context),
    noControlWrapper: false,
    isRoot: true,
  }), [context]);

  const filteredFields = applyFilters('wpifycf_definition', fields, values, { context });

  return (
    <>
      <Tabs />
      <RootFields
        fields={filteredFields}
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
