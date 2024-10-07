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

  if (['edit_term', 'user'].includes(context) && renderOptions.isRoot) {
    return (
      <p
        className={clsx(
          'description',
          'wpifycf-field__description',
          `wpifycf-field__description--${descriptionPosition}`,
        )}
      >
        {description}
      </p>
    );
  }

  if (context === 'add_term' && renderOptions.isRoot) {
    return (
      <p>
        {description}
      </p>
    )
  }

  return (
    <div
      className={clsx(
        'wpifycf-field__description',
        `wpifycf-field__description--${descriptionPosition}`,
      )}
    >
      {description}
    </div>
  )
}
