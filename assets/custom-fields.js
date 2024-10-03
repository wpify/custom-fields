import '@/styles/custom-fields.scss';
import { StrictMode, createContext } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { App } from '@/components/App';
import { addStyleSheet } from '@/helpers/functions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

require('@/helpers/field-types');

export const AppContext = createContext({});

const config = { ...window.wpifycf };
const queryClient = new QueryClient();
const render = (container, jsx) => typeof createRoot === 'function'
  ? createRoot(container).render(jsx)
  : ReactDOM.render(jsx, container);

function loadCustomFields () {
  addStyleSheet(config.stylesheet);
  document.querySelectorAll('.wpifycf-app[data-loaded=false]').forEach(container => {
    render(
      container,
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={{ context: container.dataset.context, config }}>
          <StrictMode>
            <App
              integrationId={container.dataset.integrationId}
              form={container.closest('form')}
              tabs={JSON.parse(container.dataset.tabs)}
            />
          </StrictMode>
        </AppContext.Provider>
      </QueryClientProvider>,
    );
    container.setAttribute('data-loaded', 'true');
  });
}

const edit = ({ attributes, setAttributes }) => {
  return (
    <div className="wpifycf-gutenberg-block" {...useBlockProps()}>
      BLOCK
    </div>
  );
};

const save = () => <InnerBlocks.Content />;

function loadGutenbergBlocks(event) {
  addStyleSheet(config.stylesheet);
  registerBlockType(event.detail, {
    ...event.detail.args,
    edit,
    save,
  });
}

document.addEventListener('DOMContentLoaded', loadCustomFields);
document.addEventListener('wpifycf_product_variation_loaded', loadCustomFields);
document.addEventListener('wpifycf_register_block', loadGutenbergBlocks);
jQuery(document).on('woocommerce_variations_loaded', loadCustomFields);
