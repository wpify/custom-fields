import { useState, useCallback, useMemo, useContext } from 'react';
import { InnerBlocks, useBlockProps, BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import { __, sprintf } from '@wordpress/i18n';
import { desktop, edit, Icon } from '@wordpress/icons';
import { useValidity } from '@/helpers/hooks';
import { AppContext } from '@/custom-fields';
import { RootFields } from '@/components/RootFields';

const RENDERED_VIEW = 'view';
const EDITOR_VIEW = 'edit';

export function GutenbergBlock ({ attributes, setAttributes, name, args }) {
  const props = useBlockProps();
  const [view, setView] = useState(RENDERED_VIEW);
  const switchToRenderedView = useCallback(() => setView(RENDERED_VIEW), []);
  const switchToEditorView = useCallback(() => setView(EDITOR_VIEW), []);
  const { fields } = useContext(AppContext);
  const updateValue = useCallback(key => value => setAttributes({ [key]: value }), [setAttributes]);

  return (
    <div {...props}>
      <BlockControls>
        <ToolbarGroup>
          <ToolbarButton
            isActive={view === RENDERED_VIEW}
            onClick={switchToRenderedView}
          >
            <Icon icon={desktop} />
            {__('View', 'wpify-custom-fields')}
          </ToolbarButton>
          <ToolbarButton
            isActive={view === EDITOR_VIEW}
            onClick={switchToEditorView}
          >
            <Icon icon={edit} />
            {__('Edit', 'wpify-custom-fields')}
          </ToolbarButton>
        </ToolbarGroup>
      </BlockControls>
      <div className="wpifycf-gutenberg-block">
        {view === RENDERED_VIEW && (
          <RenderedView
            title={args.title}
            name={name}
            attributes={attributes}
          />
        )}
        {view === EDITOR_VIEW && (
          <EditorView
            fields={fields}
            values={attributes}
            updateValue={updateValue}
          />
        )}
      </div>
    </div>
  );
}

function RenderedView ({ name, attributes, title }) {
  return useMemo(() => (
    <ServerSideRender
      block={name}
      attributes={attributes}
      className="wpifycf-gutenberg-block__ssr"
      httpMethod="POST"
      EmptyResponsePlaceholder={props => <EmptyResponse title={title} name={name} {...props} />}
      ErrorResponsePlaceholder={props => <ErrorResponse title={title} name={name} {...props} />}
      LoadingResponsePlaceholder={props => <LoadingResponse title={title} name={name} {...props} />}
    />
  ), [attributes, name, title]);
}

function EditorView ({ fields, values, updateValue }) {
  const { validity, validate, handleValidityChange } = useValidity();
  const { context } = useContext(AppContext);

  const renderOptions = useMemo(() => ({
    noFieldWrapper: false,
    noControlWrapper: false,
    isRoot: true,
  }), [context]);

  return (
    <RootFields
      fields={fields}
      values={values}
      updateValue={updateValue}
      renderOptions={renderOptions}
      handleValidityChange={handleValidityChange}
      validate={validate}
      validity={validity}
    />
  );
}

function EmptyResponse ({ title, name }) {
  return (
    <div
      className="wpifycf-gutenberg-block__placeholder wpifycf-gutenberg-block__placeholder--empty"
      dangerouslySetInnerHTML={{
        __html: sprintf(__('The block <strong>%1$s</strong> (<code>%2$s</code>) has no content to display.'), title, name),
      }}
    />
  );
}

function ErrorResponse ({ title, name }) {
  return (
    <div
      className="wpifycf-gutenberg-block__placeholder wpifycf-gutenberg-block__placeholder--error"
      dangerouslySetInnerHTML={{
        __html: sprintf(__('The block <strong>%1$s</strong> (<code>%2$s</code>) cannot been rendered.'), title, name),
      }}
    />
  );
}

function LoadingResponse ({ title, name }) {
  return (
    <div
      className="wpifycf-gutenberg-block__placeholder wpifycf-gutenberg-block__placeholder--loading"
      dangerouslySetInnerHTML={{
        __html: sprintf(__('Loading block <strong>%1$s</strong> (<code>%2$s</code>)...'), title, name),
      }}
    />
  );
}

export function SaveGutenbergBlock () {
  return <InnerBlocks.Content />;
}
