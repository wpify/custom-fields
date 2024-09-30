import '@/styles/custom-fields.scss';
import { StrictMode, createContext } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { App } from '@/components/App';
import { addStyleSheet } from '@/helpers/functions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

require('@/helpers/field-types');

export const AppContext = createContext({});

const config = { ...window.wpifycf };
const queryClient = new QueryClient();
const render = (container, jsx) => typeof createRoot === 'function'
  ? createRoot(container).render(jsx)
  : ReactDOM.render(jsx, container);

function loadCustomFields () {
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

document.addEventListener('DOMContentLoaded', () => {
  loadCustomFields();
  addStyleSheet(config.stylesheet);
});

document.addEventListener('wpifycf_product_variation_loaded', loadCustomFields);

jQuery(document).on('woocommerce_variations_loaded', function(event) {
    console.log('bbbb');
    loadCustomFields();
});