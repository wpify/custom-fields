import '@/styles/custom-fields.scss';
import { StrictMode, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/components/App';
import { addStyleSheet } from '@/helpers/functions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerBlockType } from '@wordpress/blocks';
import { GutenbergBlock, SaveGutenbergBlock } from '@/components/GutenbergBlock';
import { AppContextProvider } from '@/components/AppContext';

(function(config) {
  require('@/helpers/field-types');
  require('@/helpers/generators');

  const queryClient = new QueryClient();

  function loadCustomFields () {
    addStyleSheet(config.stylesheet);
    document.querySelectorAll('.wpifycf-instance[data-loaded=false][data-instance="' + config.instance + '"]').forEach(container => {
      const nodes = Array.from(document.querySelectorAll('.wpifycf-field-parent[data-integration-id="' + container.dataset.integrationId + '"]'));
      const defs = nodes.map(node => {
        return { ...JSON.parse(node.dataset.item), node };
      });
      const fields = defs.map(({ value, ...props }) => props);
      const initialValues = defs.reduce((acc, { id, value }) => ({ ...acc, [id]: value }), {});

      createRoot(container).render(
        <AppContextProvider
          context={container.dataset.context}
          config={config}
          tabs={JSON.parse(container.dataset.tabs)}
          fields={fields}
          initialValues={initialValues}
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
    if (event.detail.instance !== config.instance) {
      return;
    }

    addStyleSheet(config.stylesheet);

    let { icon } = event.detail.args;

    if (!icon) {
      icon = (
        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <path opacity="0.3"
                d="M 345.265 37.602 L 345.265 474.4 C 345.265 495.122 362.065 511.922 382.787 511.922 C 403.51 511.922 420.31 495.122 420.31 474.4 L 420.31 37.602 C 420.31 16.879 403.51 0.08 382.787 0.08 C 362.065 0.08 345.265 16.879 345.265 37.602 Z" />
          <path opacity="0.3"
                d="M 188.442 37.602 L 188.442 472.475 C 188.442 493.198 205.241 509.998 225.964 509.998 C 246.687 509.998 263.486 493.198 263.486 472.475 L 263.486 37.602 C 263.486 16.879 246.687 0.08 225.964 0.08 C 205.241 0.08 188.442 16.879 188.442 37.602 Z" />
          <path opacity="0.8"
                d="M 34.734 50.347 L 191.098 484.6 C 198.132 504.137 219.673 514.272 239.21 507.237 C 258.747 500.202 268.882 478.662 261.848 459.125 L 105.484 24.871 C 98.45 5.335 76.909 -4.801 57.371 2.234 C 37.835 9.269 27.699 30.81 34.734 50.347 Z" />
          <path opacity="0.8"
                d="M 190.114 50.347 L 347.388 487.129 C 354.423 506.666 375.963 516.802 395.5 509.767 C 415.037 502.732 425.173 481.191 418.138 461.654 L 260.864 24.871 C 253.829 5.334 232.289 -4.801 212.751 2.234 C 193.215 9.269 183.079 30.81 190.114 50.347 Z" />
          <path opacity="0.8"
                d="M 347.419 50.347 L 406.575 214.632 C 413.61 234.17 435.15 244.304 454.687 237.27 C 474.224 230.236 484.36 208.694 477.325 189.157 L 418.17 24.871 C 411.135 5.334 389.594 -4.801 370.057 2.234 C 350.52 9.269 340.384 30.81 347.419 50.347 Z" />
        </svg>
      );
    }

    const EditGutenbergBlock =  ({ attributes, setAttributes, ...props }) => {
      const updateValue = useCallback(key => value => setAttributes({ [key]: value }), [setAttributes]);
      return (
        <AppContextProvider
          context="gutenberg"
          config={config}
          tabs={event.detail.tabs}
          fields={event.detail.items}
          values={attributes}
          updateValue={updateValue}
        >
          <QueryClientProvider client={queryClient}>
            <StrictMode>
              <GutenbergBlock
                {...props}
                name={event.detail.name}
                args={event.detail.args}
              />
            </StrictMode>
          </QueryClientProvider>
        </AppContextProvider>
      )
    };

    registerBlockType(event.detail, {
      ...event.detail.args,
      icon,
      edit: EditGutenbergBlock,
      save: SaveGutenbergBlock,
    });
  }

  document.addEventListener('DOMContentLoaded', loadCustomFields);
  document.addEventListener('wpifycf_register_block_' + config.instance, loadGutenbergBlocks);

  if (typeof jQuery !== 'undefined') {
    jQuery(document).on('woocommerce_variations_loaded', loadCustomFields);
    jQuery(document).on('menu-item-added', loadCustomFields);
  }
})(JSON.parse(JSON.stringify(window.wpifycf)));
