import { StrictMode } from 'react';
import { createRoot } from 'react-dom';
import { App } from '@/components/App';
import { addStyleSheet } from '@/helpers/functions';
import '@/styles/custom-fields.scss';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

require('@/helpers/field-types');

const config = { ...window.wpifycf };
const queryClient = new QueryClient();

function loadCustomFields (event) {
  document.querySelectorAll('.wpifycf-app[data-loaded=false]').forEach(function (container) {
    const form = container.closest('form');

    createRoot(container).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <App
            integrationId={container.dataset.integrationId}
            form={form}
            context={container.dataset.context}
            config={config}
          />
          <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
      </StrictMode>,
    );

    container.setAttribute('data-loaded', 'true');
  });
}

document.addEventListener('DOMContentLoaded', function () {
  loadCustomFields();
  addStyleSheet(config.stylesheet);
});

document.addEventListener('wpifycf_product_variation_loaded', loadCustomFields);
