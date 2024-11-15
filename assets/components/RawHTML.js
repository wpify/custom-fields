import { ErrorBoundary } from 'react-error-boundary'

export function RawHTML ({ html }) {
  return (
    <ErrorBoundary fallback={html}>
      <span dangerouslySetInnerHTML={{ __html: html }}/>
    </ErrorBoundary>
  );
}
