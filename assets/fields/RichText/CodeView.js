import { ErrorBoundary } from 'react-error-boundary';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import { EditorView } from '@codemirror/view';

export function CodeView({ value, onChange, height = 300, disabled = false }) {
  return (
    <ErrorBoundary
      fallback={(
        <textarea
          className="wpifycf-field-richtext__code-fallback"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          style={{ width: '100%', height: height + 'px' }}
          disabled={disabled}
        />
      )}
    >
      <CodeMirror
        className="wpifycf-field-richtext__code-view"
        value={value || ''}
        onChange={onChange}
        height={height + 'px'}
        extensions={[EditorView.lineWrapping, htmlLang()]}
        editable={!disabled}
      />
    </ErrorBoundary>
  );
}

export default CodeView;
