import '@/styles/custom-fields.scss';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom';
import { App } from '@/components/App';
import { addStyleSheet } from '@/helpers/functions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

require('@/helpers/field-types');

const config = { ...window.wpifycf };
const queryClient = new QueryClient();

function loadCustomFields () {
  document.querySelectorAll('.wpifycf-app[data-loaded=false]').forEach(function (container) {
    const form = container.closest('form');

    createRoot(container).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <App
            integrationId={container.dataset.integrationId}
            form={form}
            context={container.dataset.context}
            tabs={container.dataset.tabs}
            config={config}
          />
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
