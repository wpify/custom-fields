import { useEffect, useRef, useState } from 'react';
import { addFilter } from '@wordpress/hooks';
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Code } from '@/fields/Code';

const VIEW_VISUAL = 'visual';
const VIEW_HTML = 'html';

export function Wysiwyg ({
  id,
  htmlId,
  name,
  value,
  onChange,
  height = '200px',
}) {
  const [view, setView] = useState(VIEW_VISUAL);

  return (
    <span className="wpifycf-field-wysiwyg">
      <span className="wpifycf-field-wysiwyg__tabs">
        <button
          type="button"
          className={clsx('wpifycf-field-wysiwyg__tab', view === VIEW_VISUAL && 'active')}
          onClick={() => setView(VIEW_VISUAL)}
        >
          {__('Visual', 'wpify-custom-fields')}
        </button>
        <button
          type="button"
          className={clsx('wpifycf-field-wysiwyg__tab', view === VIEW_HTML && 'active')}
          onClick={() => setView(VIEW_HTML)}
        >
          {__('HTML', 'wpify-custom-fields')}
        </button>
      </span>
      {view === VIEW_VISUAL && (
        <VisualView
          htmlId={htmlId}
          name={name}
          value={value}
          onChange={onChange}
          height={height}
        />
      )}
      {view === VIEW_HTML && (
        <Code
          name={name}
          value={value}
          onChange={onChange}
          height={height}
          id={id}
          htmlId={htmlId}
          language="html"
        />
      )}
    </span>
  );
}

function VisualView ({ htmlId, name, value, onChange, height }) {
  const editorRef = useRef(null);
  const [view, setView] = useState(VIEW_VISUAL);

  useEffect(() => {
    const { baseURL, suffix, settings } = window.wpEditorL10n.tinymce;

    window.tinymce.EditorManager.overrideDefaults({
      base_url: baseURL,
      suffix,
    });

    window.wp.oldEditor.initialize(htmlId, {
      tinymce: {
        ...settings,
        setup (editor) {
          editorRef.current = editor;
          // editor.on('init', () => {
          //   const doc = editor.getDoc();
          //   styles.forEach(({ css }) => {
          //     const styleEl = doc.createElement('style');
          //     styleEl.innerHTML = css;
          //     doc.head.appendChild(styleEl);
          //   });
          // });

          editor.on('change keyup', function () {
            const content = editor.getContent();

            if (onChange) {
              onChange(content);
            }
          });
        },
      },
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.off('change keyup');
        editorRef.current.remove();
      }

      window.wp.oldEditor.remove(htmlId);
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.getContent() !== value) {
      editor.setContent(value || '');
    }
  }, [value]);

  return (
    <textarea name={name} id={htmlId} onChange={onChange} value={value} />
  );
}

Wysiwyg.VIEW_VISUAL = VIEW_VISUAL;
Wysiwyg.VIEW_HTML = VIEW_HTML;

addFilter('wpifycf_field_wysiwyg', 'wpify_custom_fields', () => Wysiwyg);
