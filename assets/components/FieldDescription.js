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

  if (context === 'edit_term' && renderOptions.isRoot) {
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

  return (
    <span
      className={clsx(
        'wpifycf-field__description',
        `wpifycf-field__description--${descriptionPosition}`,
      )}
    >
      {description}
    </span>
  )
}
