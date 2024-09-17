import { Editor } from '@monaco-editor/react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';

function Code ({
  id,
  name,
  value,
  onChange,
  language = 'html',
  height = 200,
  theme = 'dark',
  attributes = {},
}) {
  return (
    <>
      {name && (
        <input type="hidden" name={name} value={value} />
      )}
      <Editor
        className={clsx('wpifycf-field-code', `wpifycf-field-code--${id}`, attributes.class)}
        defaultValue={value}
        onChange={onChange}
        defaultLanguage={language}
        height={height}
        theme={theme === 'dark' ? 'vs-dark' : theme}
        options={{
          codeLens: false,
          minimap: { enabled: false },
        }}
        loading={<textarea value={value} style={{ width: '100%', height }} readOnly />}
      />
    </>
  );
}

addFilter('wpifycf_field_code', 'wpify_custom_fields', () => Code);
