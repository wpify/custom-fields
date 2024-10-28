import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { ErrorBoundary } from 'react-error-boundary';
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
import { EditorView } from '@codemirror/view'
import { checkValidityStringType } from '@/helpers/validators';

export function Code ({
  id,
  value = '',
  onChange,
  language = 'html',
  height = 200,
  theme = 'dark',
  attributes = {},
  className,
  disabled = false,
}) {
  const extensions = [EditorView.lineWrapping];
  const languageExtension = getLanguageExtension(language);

  if (languageExtension) {
    extensions.push(languageExtension);
  }

  return (
    <ErrorBoundary
      fallback={(
        <textarea
          className={clsx('wpifycf-field-code', 'wpifycf-field-code--fallback', `wpifycf-field-code--${id}`, attributes.class, className)}
          value={value}
          onChange={event => onChange(event.target.value)}
          style={{ width: '100%', height: height + 'px' }}
          disabled={disabled}
        />
      )}
    >
      <CodeMirror
        className={clsx('wpifycf-field-code', `wpifycf-field-code--${id}`, attributes.class)}
        value={value}
        onChange={onChange}
        height={height + 'px'}
        theme={theme === 'dark' ? vscodeDark : undefined}
        extensions={extensions}
        editable={!disabled}
      />
    </ErrorBoundary>
  );
}

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

Code.checkValidity = checkValidityStringType;

addFilter('wpifycf_field_code', 'wpify_custom_fields', () => Code);
