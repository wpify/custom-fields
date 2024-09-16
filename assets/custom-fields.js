import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { App } from '@/components/App';
import { registerFieldTypes } from '@/helpers/field-types';
import { addStyleSheet } from '@/helpers/functions';
import '@/styles/custom-fields.scss';

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
  registerFieldTypes();
  loadCustomFields();
  addStyleSheet(window.wpifycf_custom_fields.stylesheet);
});

document.addEventListener('wpifycf_product_variation_loaded', loadCustomFields);
