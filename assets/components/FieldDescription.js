import clsx from 'clsx';
import { useContext } from 'react';
import { AppContext } from '@/custom-fields';

export function FieldDescription({
  renderOptions = {},
  description,
  descriptionPosition
}) {
  const { context } = useContext(AppContext);

  if (! description) {
    return null;
  }

  if (['edit_term', 'user', 'add_term'].includes(context) && renderOptions.isRoot) {
    return (
      <p
        className={clsx(
          'description',
          'wpifycf-field__description',
          `wpifycf-field__description--${descriptionPosition}`,
        )}
        dangerouslySetInnerHTML={{ __html: description }}
      />
    );
  }

  return (
    <div
      className={clsx(
        'wpifycf-field__description',
        `wpifycf-field__description--${descriptionPosition}`,
      )}
      dangerouslySetInnerHTML={{ __html: description }}
    />
  )
}
