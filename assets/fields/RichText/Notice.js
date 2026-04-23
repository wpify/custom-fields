import { useState } from 'react';
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { close as closeIcon } from '@wordpress/icons';

export function Notice({ variant = 'info', message, details, actionLabel, onAction, onDismiss }) {
  const [expanded, setExpanded] = useState(false);
  if (!message) return null;
  return (
    <div className={clsx('wpifycf-field-richtext__notice', `wpifycf-field-richtext__notice--${variant}`)}>
      <div className="wpifycf-field-richtext__notice-main">
        <span className="wpifycf-field-richtext__notice-message">{message}</span>
        {details && (
          <Button
            variant="link"
            size="small"
            className="wpifycf-field-richtext__notice-toggle"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? __('Hide changes', 'wpify-custom-fields') : __('View changes', 'wpify-custom-fields')}
          </Button>
        )}
        {actionLabel && (
          <Button variant="tertiary" size="small" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        <Button
          className="wpifycf-field-richtext__notice-close"
          icon={closeIcon}
          label={__('Dismiss', 'wpify-custom-fields')}
          onClick={onDismiss}
        />
      </div>
      {expanded && details && (
        <div className="wpifycf-field-richtext__notice-details">
          <div>
            <strong>{__('Source', 'wpify-custom-fields')}</strong>
            <pre>{details.source}</pre>
          </div>
          <div>
            <strong>{__('Normalized', 'wpify-custom-fields')}</strong>
            <pre>{details.normalized}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notice;
