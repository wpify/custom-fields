import { useState, useCallback, useContext } from 'react';
import { InnerBlocks, useBlockProps, BlockControls, InspectorControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup, Panel, PanelRow, PanelBody } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { desktop, edit, Icon } from '@wordpress/icons';
import { applyFilters } from '@wordpress/hooks';
import { useDebounce } from '@uidotdev/usehooks';
import { useValidity } from '@/helpers/hooks';
import { AppContext } from '@/components/AppContext';;
import { RootFields } from '@/components/RootFields';
import { Tabs } from '@/components/Tabs';
import { useRenderBlock } from '@/helpers/hooks';
import { useSelect } from '@wordpress/data';
import { ErrorBoundary } from 'react-error-boundary';
import { Field } from '@/components/Field';
import parse from 'html-react-parser';

const RENDERED_VIEW = 'view';
const EDITOR_VIEW = 'edit';

export function GutenbergBlock ({ name, args }) {
  const props = useBlockProps();
  const [view, setView] = useState(RENDERED_VIEW);
  const switchToRenderedView = useCallback(() => setView(RENDERED_VIEW), []);
  const switchToEditorView = useCallback(() => setView(EDITOR_VIEW), []);
  const { fields, values, updateValue } = useContext(AppContext);
  const blockFields = fields.filter(field => field.position !== 'inspector');
  const inspectorFields = fields.filter(field => field.position === 'inspector');
  const { validity, validate, handleValidityChange } = useValidity();
  const filteredFields = applyFilters('wpifycf_definition', fields, values, { context: 'gutenberg', name, args });

  return (
    <div {...props}>
      {blockFields.length > 0 && (
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
      )}
      <div className="wpifycf-gutenberg-block">
        {view === RENDERED_VIEW && (
          <RenderedView
            title={args.title}
            name={name}
            attributes={values}
            fields={fields}
          />
        )}
        {view === EDITOR_VIEW && (
          <EditorView
            fields={filteredFields}
            values={values}
            updateValue={updateValue}
          />
        )}
      </div>
      {inspectorFields.length > 0 && (
        <InspectorControls>
          <Panel>
            <PanelBody title={__('Settings', 'wpify-custom-fields')}>
              {inspectorFields.map(field => (
                <PanelRow key={field.id}>
                  <Field
                    key={field.id}
                    {...field}
                    name={field.name || field.id}
                    value={values[field.id]}
                    htmlId={field.id.replace(/[\[\]]+/g, '_')}
                    onChange={updateValue(field.id)}
                    renderOptions={{
                      noFieldWrapper: false,
                      noControlWrapper: false,
                      isRoot: true,
                    }}
                    setValidity={handleValidityChange(field.id)}
                    validity={validate ? validity[field.id] : []}
                    fieldPath={field.id}
                    setTitle={() => null}
                  />
                </PanelRow>
              ))}
            </PanelBody>
          </Panel>
        </InspectorControls>
      )}
    </div>
  );
}

function RenderedView ({ name, attributes, title, fields }) {
  const postId = useSelect(
    select => select('core/editor')?.getCurrentPostId(),
  );

  const debouncedAttributes = useDebounce(attributes, 500);

  const renderer = useRenderBlock({
    blockName: name,
    attributes: debouncedAttributes,
    postId,
  });

  // Find inner_blocks field configuration
  const innerBlocksField = fields.find(field => field.type === 'inner_blocks');

  // Create parse options with replace function
  const parseOptions = {
    replace: (domNode) => {
      // Check if it's a comment node matching our placeholder pattern
      if (domNode.type === 'comment' && innerBlocksField) {
        const commentData = domNode.data.trim();
        // Match: "inner_blocks", "inner_blocks/", "inner_blocks /"
        if (/^inner_blocks[\s/]*$/.test(commentData)) {
          return (
            <InnerBlocks
              allowedBlocks={innerBlocksField.allowed_blocks}
              template={innerBlocksField.template}
              orientation={innerBlocksField.orientation}
              templateLock={innerBlocksField.template_lock}
            />
          );
        }
      }
    }
  };

  if (renderer.isFetching) {
    return <LoadingResponse title={title} name={name} />;
  }

  if (renderer.isError) {
    return <ErrorResponse title={title} name={name} />;
  }

  if (!renderer.data) {
    return <EmptyResponse title={title} name={name} />;
  }

  return (
    <ErrorBoundary fallback={<ErrorResponse title={title} name={name} />}>
      <div className="wpifycf-gutenberg-block__ssr">
        {parse(renderer.data, parseOptions)}
      </div>
    </ErrorBoundary>
  );
}

function EditorView ({ fields, values, updateValue }) {
  const { validity, validate, handleValidityChange } = useValidity();
  const blockFields = fields.filter(field => field.position !== 'inspector');

  return (
    <>
      <Tabs />
      <div className="wpifycf-gutenberg-block__fields">
        <RootFields
          fields={blockFields}
          values={values}
          updateValue={updateValue}
          renderOptions={{
            noFieldWrapper: false,
            noControlWrapper: false,
            isRoot: true,
          }}
          handleValidityChange={handleValidityChange}
          validate={validate}
          validity={validity}
        />
      </div>
    </>
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
