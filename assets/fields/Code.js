import { Editor } from '@monaco-editor/react';

export function Code ({ name, value, onChange, language = 'html', height = 200, theme = 'dark' }) {
  return (
    <>
      {name && (
        <input type="hidden" name={name} value={value} />
      )}
      <Editor
        defaultValue={value}
        onChange={onChange}
        defaultLanguage={language}
        height={height}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          codeLens: false,
          minimap: { enabled: false },
        }}
      />
    </>
  );
}
