import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { App } from '@/components/App';
import { registerFieldTypes } from '@/helpers/field-types';

import '@/styles/custom-fields.scss';
import { addStyleSheet } from '@/helpers/functions';

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

    // TODO: Add a correct loading for product variations

    container.setAttribute('data-loaded', 'true');
  });
}

document.addEventListener('DOMContentLoaded', function () {
  registerFieldTypes();
  loadCustomFields();
  addStyleSheet(window.wpifycf_custom_fields.stylesheet);
});

document.addEventListener('wpifycf_product_variation_loaded', loadCustomFields);
