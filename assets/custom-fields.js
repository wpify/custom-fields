import '@/styles/custom-fields.scss';
import { StrictMode, createContext } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/components/App';
import { addStyleSheet } from '@/helpers/functions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerBlockType } from '@wordpress/blocks';
import { GutenbergBlock, SaveGutenbergBlock } from '@/components/GutenbergBlock';
import { AppContextProvider } from '@/components/AppContextProvider';

require('@/helpers/field-types');

export const AppContext = createContext({});
const config = { ...window.wpifycf };
const queryClient = new QueryClient();
const render = (container, jsx) => createRoot(container).render(jsx);

function loadCustomFields () {
  addStyleSheet(config.stylesheet);
  document.querySelectorAll('.wpifycf-app[data-loaded=false]').forEach(container => {
    render(
      container,
      <AppContextProvider
        context={container.dataset.context}
        config={config}
        tabs={JSON.parse(container.dataset.tabs)}
        integrationId={container.dataset.integrationId}
      >
        <QueryClientProvider client={queryClient}>
          <StrictMode>
            <App form={container.closest('form')} />
          </StrictMode>
        </QueryClientProvider>
      </AppContextProvider>,
    );
    container.setAttribute('data-loaded', 'true');
  });
}

function loadGutenbergBlocks (event) {
  addStyleSheet(config.stylesheet);
  registerBlockType(event.detail, {
    ...event.detail.args,
    edit: props => (
      <AppContextProvider
        context="gutenberg"
        config={config}
        tabs={event.detail.tabs}
        fields={event.detail.items}
      >
        <QueryClientProvider client={queryClient}>
          <StrictMode>
            <GutenbergBlock {...props} args={event.detail.args} />
          </StrictMode>
        </QueryClientProvider>
      </AppContextProvider>
    ),
    save: SaveGutenbergBlock,
  });
}

document.addEventListener('DOMContentLoaded', loadCustomFields);
document.addEventListener('wpifycf_register_block', loadGutenbergBlocks);
jQuery(document).on('woocommerce_variations_loaded', loadCustomFields);
