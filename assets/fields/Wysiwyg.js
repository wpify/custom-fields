import { useEffect, useRef } from 'react';
import { addFilter } from '@wordpress/hooks';

export function Wysiwyg ({ id, htmlId, name, value, onChange }) {
  const editorRef = useRef(null);

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
    <span className="wpifycf-field-wysiwyg">
      <textarea name={name} id={htmlId} onChange={onChange} value={value} />
    </span>
  );
}

addFilter('wpifycf_field_wysiwyg', 'wpify_custom_fields', () => Wysiwyg);
