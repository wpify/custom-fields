import { RawHTML } from '@wordpress/element';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { addFilter } from '@wordpress/hooks';
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Code } from '@/fields/Code';
import { checkValidityStringType } from '@/helpers/validators';
import { useSelect } from '@wordpress/data';
import { store } from '@wordpress/block-editor';
import { AppContext } from '@/custom-fields';
import {
  Modal,
  Button,
  Flex,
  FlexItem,
} from '@wordpress/components';
import { fullscreen } from '@wordpress/icons';

const VIEW_VISUAL = 'visual';
const VIEW_HTML = 'html';

export function Wysiwyg ({
  id,
  htmlId,
  value,
  onChange,
  height = 200,
  className,
  disabled = false,
}) {
  const [view, setView] = useState(VIEW_VISUAL);
  const { context } = useContext(AppContext);

  return (
    <div className={clsx('wpifycf-field-wysiwyg', `wpifycf-field-wysiwyg--${id}`, className)}>
      <div className="wpifycf-field-wysiwyg__tabs">
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
      </div>
      {view === VIEW_VISUAL && (
        disabled ? (
          <RawHTML className="wpifycf-field-wysiwyg__raw">
            {value}
          </RawHTML>
        ) : context === 'gutenberg' ? (
          <GutenbergTinyMCE
            htmlId={htmlId}
            value={value}
            onChange={onChange}
            height={height}
            disabled={disabled}
          />
        ) : (
          <TinyMCE
            htmlId={htmlId}
            value={value}
            onChange={onChange}
            height={height}
            disabled={disabled}
          />
        )
      )}
      {view === VIEW_HTML && (
        <Code
          value={value}
          onChange={onChange}
          height={height + 94}
          id={id}
          htmlId={htmlId}
          language="html"
          theme="light"
          disabled={disabled}
        />
      )}
    </div>
  );
}

Wysiwyg.checkValidity = checkValidityStringType;

function GutenbergTinyMCE ({ htmlId, value, onChange, height, disabled }) {
  const [isOpen, setOpen] = useState(false);
  const [isModalFullScreen, setIsModalFullScreen] = useState(false);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleToggleFullscreen = useCallback(() => setIsModalFullScreen(!isModalFullScreen), [isModalFullScreen]);
  const sanitizedId = htmlId.replace(/\./g, '__');

  return (
    <>
      <div
        className="wpifycf-field-wysiwyg__raw-wrapper"
        style={{ height: height + 94 }}
      >
        <RawHTML className="wpifycf-field-wysiwyg__raw" onClick={handleOpen}>
          {value}
        </RawHTML>
        {!disabled && (
          <Button
            onClick={handleOpen}
            label={__('Edit')}
            variant="primary"
            className="wpifycf-field-wysiwyg__raw-edit"
          >
            {__('Edit')}
          </Button>
        )}
      </div>
      {isOpen && (
        <Modal
          title={__('Classic Editor')}
          onRequestClose={handleClose}
          shouldCloseOnClickOutside={false}
          overlayClassName="block-editor-freeform-modal"
          isFullScreen={isModalFullScreen}
          className="block-editor-freeform-modal__content"
          headerActions={
            <Button
              size="small"
              onClick={handleToggleFullscreen}
              icon={fullscreen}
              isPressed={isModalFullScreen}
              label={
                isModalFullScreen
                  ? __('Exit fullscreen')
                  : __('Enter fullscreen')
              }
            />
          }
        >
          <TinyMCE
            htmlId={sanitizedId}
            value={value}
            onChange={onChange}
            height={height}
          />
          <Flex
            className="block-editor-freeform-modal__actions"
            justify="flex-end"
            expanded={false}
          >
            <FlexItem>
              <Button
                __next40pxDefaultSize
                variant="primary"
                onClick={handleClose}
              >
                {__('OK')}
              </Button>
            </FlexItem>
          </Flex>
        </Modal>
      )}
    </>
  );
}

function TinyMCE ({ htmlId, value, onChange, height, disabled }) {
  const editorRef = useRef(null);
  const styles = useSelect(
    select => select(store).getSettings().styles,
  );

  const sanitizedId = htmlId.replace(/\./g, '__');

  useEffect(() => {
    const { baseURL, suffix, settings } = window.wpEditorL10n.tinymce;

    window.tinymce.EditorManager.overrideDefaults({
      base_url: baseURL,
      suffix,
    });

    window.wp.oldEditor.initialize(sanitizedId, {
      tinymce: {
        ...settings,
        height,
        setup (editor) {
          editorRef.current = editor;
          editor.on('init', () => {
            const doc = editor.getDoc();
            styles?.forEach(({ css }) => {
              const styleEl = doc.createElement('style');
              styleEl.innerHTML = css;
              doc.head.appendChild(styleEl);
            });
          });

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

      window.wp.oldEditor.remove(sanitizedId);
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.getContent() !== value) {
      editor.setContent(value || '');
    }
  }, [value]);

  return (
    <textarea id={sanitizedId} onChange={onChange} value={value} />
  );
}

Wysiwyg.VIEW_VISUAL = VIEW_VISUAL;
Wysiwyg.VIEW_HTML = VIEW_HTML;

addFilter('wpifycf_field_wysiwyg', 'wpify_custom_fields', () => Wysiwyg);
