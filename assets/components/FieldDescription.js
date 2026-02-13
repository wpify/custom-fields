import clsx from 'clsx';

export function FieldDescription({
  description,
  descriptionPosition
}) {
  if (! description) {
    return null;
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
