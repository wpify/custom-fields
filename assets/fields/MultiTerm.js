import { addFilter } from '@wordpress/hooks';
import { useTerms } from '@/helpers/hooks';
import { __ } from '@wordpress/i18n';
import { MultiSelect } from '@/fields/MultiSelect';
import { CategoryTree } from '@/fields/Term';
import { useMemo } from 'react';
import { checkValidityMultiNonZeroType } from '@/helpers/validators';
import clsx from 'clsx';

export function MultiTerm ({
  taxonomy,
  id,
  htmlId,
  value = [],
  onChange,
  className,
  disabled = false,
}) {
  const { data: terms, isError, isFetching } = useTerms({ taxonomy });

  const termOptions = useMemo(
    () => terms.map(term => ({ value: term.id, label: term.name })),
    [terms],
  );

  let content;

  if (isFetching) {
    content = __('Loading terms...', 'wpify-custom-fields');
  } else if (isError) {
    content = __('Error in loading terms...', 'wpify-custom-fields');
  } else if (terms.length === 0) {
    content = __('No terms found...', 'wpify-custom-fields');
  } else if (terms.some(term => term.children)) {
    content = (
      <CategoryTree
        categories={terms}
        value={value}
        onChange={onChange}
        type="checkbox"
        htmlId={htmlId}
        disabled={disabled}
      />
    );
  } else {
    content = (
      <MultiSelect
        id={id}
        htmlId={htmlId}
        value={value}
        onChange={onChange}
        options={termOptions}
        disabled={disabled}
      />
    );
  }

  return (
    <div className={clsx('wpifycf-field-term', `wpifycf-field-term--${id}`, className)}>
      {content}
    </div>
  );
}

MultiTerm.checkValidity = checkValidityMultiNonZeroType;

addFilter('wpifycf_field_multi_term', 'wpify_custom_fields', () => MultiTerm);
