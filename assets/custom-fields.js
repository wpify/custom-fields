import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { App } from '@/components/App';
import { addStyleSheet } from '@/helpers/functions';
import '@/styles/custom-fields.scss';

require('@/helpers/field-types');

function loadCustomFields (event) {
  document.querySelectorAll('.wpifycf-app[data-loaded=false]').forEach(function (container) {
    const form = container.closest('form');

    ReactDOM.createRoot(container).render(
      <StrictMode>
        <App
          integrationId={container.dataset.integrationId}
          form={form}
          context={container.dataset.context}
        />
      </StrictMode>,
    );

    container.setAttribute('data-loaded', 'true');
  });
}

document.addEventListener('DOMContentLoaded', function () {
  loadCustomFields();
  addStyleSheet(window.wpifycf_custom_fields.stylesheet);
});

document.addEventListener('wpifycf_product_variation_loaded', loadCustomFields);
