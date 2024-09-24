import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { sql } from '@codemirror/lang-sql';
import { php } from '@codemirror/lang-php';
import { markdown } from '@codemirror/lang-markdown';
import { xml } from '@codemirror/lang-xml';
import { json } from '@codemirror/lang-json';
import { ErrorBoundary } from 'react-error-boundary';

function getLanguageExtension (language) {
  switch (language) {
    case 'javascript':
    case 'js':
      return javascript();
    case 'html':
      return html();
    case 'css':
      return css();
    case 'sql':
      return sql();
    case 'php':
      return php();
    case 'markdown':
    case 'md':
      return markdown();
    case 'xml':
      return xml();
    case 'json':
      return json();
    default:
      return null;
  }
}

export function Code ({
  id,
  name,
  value,
  onChange,
  language = 'html',
  height = '200px',
  attributes = {},
}) {
  const languageExtension = getLanguageExtension(language);

  return (
    <>
      {name && (
        <input type="hidden" name={name} value={value} />
      )}
      <ErrorBoundary
        fallback={(
          <textarea
            className={clsx('wpifycf-field-code', 'wpifycf-field-code--fallback', `wpifycf-field-code--${id}`, attributes.class)}
            value={value}
            onChange={event => onChange(event.target.value)}
            style={{ width: '100%', height }}
          />
        )}
      >
        <CodeMirror
          className={clsx('wpifycf-field-code', `wpifycf-field-code--${id}`, attributes.class)}
          value={value}
          onChange={onChange}
          height={height}
          theme={vscodeDark}
          extensions={languageExtension ? [languageExtension] : []}
        />
      </ErrorBoundary>
    </>
  );
}

addFilter('wpifycf_field_code', 'wpify_custom_fields', () => Code);
