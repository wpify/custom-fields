import { ErrorBoundary } from 'react-error-boundary';
import clsx from 'clsx';

export function Html ({
  attributes = {},
  className,
  content,
}) {
  return (
    <ErrorBoundary fallback={<div>Failed to render HTML field</div>}>
      <div
        className={clsx('wpifycf-field-html', className)}
        {...attributes}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </ErrorBoundary>
  );
}
