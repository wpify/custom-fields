import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useState } from 'react';
import { useCloudflareZones } from '@/helpers/hooks';
import { Button } from '@/components/Button';
import clsx from 'clsx';

const defaultValue = {
  email: '',
  api_key: '',
  zone_id: '',
  zone_name: '',
  account_id: '',
  account_name: '',
};

/**
 * Official Cloudflare logo cloud mark.
 *
 * Paths sourced from @cloudflare/component-logo (LogoCloud).
 *
 * @see https://cf-icons.pages.dev/
 * @see https://www.cloudflare.com/press/press-kit/
 */
function CloudflareIcon () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 271.2" width="34" height="20" role="img" aria-hidden="true">
      <path fill="#faad3f" d="M328.6,125.6c-0.8,0-1.5,0.6-1.8,1.4l-4.8,16.7c-2.1,7.2-1.3,13.8,2.2,18.7c3.2,4.5,8.6,7.1,15.1,7.4l26.2,1.6c0.8,0,1.5,0.4,1.9,1c0.4,0.6,0.5,1.5,0.3,2.2c-0.4,1.2-1.6,2.1-2.9,2.2l-27.3,1.6c-14.8,0.7-30.7,12.6-36.3,27.2l-2,5.1c-0.4,1,0.3,2,1.4,2h93.8c1.1,0,2.1-0.7,2.4-1.8c1.6-5.8,2.5-11.9,2.5-18.2c0-37-30.2-67.2-67.3-67.2C330.9,125.5,329.7,125.5,328.6,125.6z" />
      <path fill="#f48120" d="M292.8,204.4c2.1-7.2,1.3-13.8-2.2-18.7c-3.2-4.5-8.6-7.1-15.1-7.4l-123.1-1.6c-0.8,0-1.5-0.4-1.9-1s-0.5-1.4-0.3-2.2c0.4-1.2,1.6-2.1,2.9-2.2l124.2-1.6c14.7-0.7,30.7-12.6,36.3-27.2l7.1-18.5c0.3-0.8,0.4-1.6,0.2-2.4c-8-36.2-40.3-63.2-78.9-63.2c-35.6,0-65.8,23-76.6,54.9c-7-5.2-15.9-8-25.5-7.1c-17.1,1.7-30.8,15.4-32.5,32.5c-0.4,4.4-0.1,8.7,0.9,12.7c-27.9,0.8-50.2,23.6-50.2,51.7c0,2.5,0.2,5,0.5,7.5c0.2,1.2,1.2,2.1,2.4,2.1h227.2c1.3,0,2.5-0.9,2.9-2.2L292.8,204.4z" />
    </svg>
  );
}

function DisconnectedView ({ onConnect, disabled }) {
  return (
    <button
      type="button"
      className="wpifycf-field-cloudflare__connect-btn"
      onClick={onConnect}
      disabled={disabled}
    >
      <CloudflareIcon />
      {__('Connect to Cloudflare', 'wpify-custom-fields')}
    </button>
  );
}

function CredentialsView ({ email, apiKey, onEmailChange, onApiKeyChange, onValidate, onCancel, disabled }) {
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onValidate();
    }
  }, [onValidate]);

  return (
    <div className="wpifycf-field-cloudflare__card">
      <div className="wpifycf-field-cloudflare__form">
        <label className="wpifycf-field-cloudflare__form-label">
          {__('Cloudflare Email', 'wpify-custom-fields')}
        </label>
        <input
          type="email"
          className="wpifycf-field-cloudflare__form-input"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="email@example.com"
        />
        <label className="wpifycf-field-cloudflare__form-label">
          {__('Global API Key', 'wpify-custom-fields')}
        </label>
        <input
          type="password"
          className="wpifycf-field-cloudflare__form-input"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
      </div>
      <p
        className="wpifycf-field-cloudflare__help"
        dangerouslySetInnerHTML={{
          __html: __('Find your Global API Key in <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noreferrer noopener">Cloudflare Dashboard → API Tokens</a>.', 'wpify-custom-fields'),
        }}
      />
      <div className="wpifycf-field-cloudflare__actions">
        <Button primary onClick={onValidate} disabled={disabled || !email || !apiKey}>
          {__('Validate', 'wpify-custom-fields')}
        </Button>
        <Button onClick={onCancel} disabled={disabled}>
          {__('Cancel', 'wpify-custom-fields')}
        </Button>
      </div>
    </div>
  );
}

function ZoneListView ({ email, apiKey, onSelect, onBack, disabled }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useCloudflareZones({ email, apiKey, page });

  if (isLoading) {
    return (
      <div className="wpifycf-field-cloudflare__card">
        <p>{__('Loading zones…', 'wpify-custom-fields')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="wpifycf-field-cloudflare__card">
        <p className="wpifycf-field-cloudflare__error">
          {error?.message || __('Failed to load zones.', 'wpify-custom-fields')}
        </p>
        <div className="wpifycf-field-cloudflare__actions">
          <Button onClick={onBack} disabled={disabled}>
            {__('Back', 'wpify-custom-fields')}
          </Button>
        </div>
      </div>
    );
  }

  const zones = data?.zones || [];
  const totalPages = data?.total_pages || 1;

  return (
    <div className="wpifycf-field-cloudflare__card">
      <p className="wpifycf-field-cloudflare__zone-heading">
        {__('Select a zone:', 'wpify-custom-fields')}
      </p>
      {zones.length === 0 ? (
        <p>{__('No zones found.', 'wpify-custom-fields')}</p>
      ) : (
        <ul className="wpifycf-field-cloudflare__zone-list">
          {zones.map((zone) => (
            <li key={zone.zone_id}>
              <button
                type="button"
                className="wpifycf-field-cloudflare__zone-item"
                onClick={() => onSelect(zone)}
                disabled={disabled}
              >
                <span className="wpifycf-field-cloudflare__zone-name">{zone.zone_name}</span>
                <span className="wpifycf-field-cloudflare__zone-account">{zone.account_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <div className="wpifycf-field-cloudflare__pagination">
          <Button onClick={() => setPage((p) => p - 1)} disabled={disabled || page <= 1}>
            {__('Previous', 'wpify-custom-fields')}
          </Button>
          <span className="wpifycf-field-cloudflare__page-info">
            {page} / {totalPages}
          </span>
          <Button onClick={() => setPage((p) => p + 1)} disabled={disabled || page >= totalPages}>
            {__('Next', 'wpify-custom-fields')}
          </Button>
        </div>
      )}
      <div className="wpifycf-field-cloudflare__actions">
        <Button onClick={onBack} disabled={disabled}>
          {__('Back', 'wpify-custom-fields')}
        </Button>
      </div>
    </div>
  );
}

function ConnectedView ({ value, onDisconnect, disabled }) {
  return (
    <div className="wpifycf-field-cloudflare__card wpifycf-field-cloudflare__connected">
      <div className="wpifycf-field-cloudflare__connected-icon">
        <CloudflareIcon />
      </div>
      <div className="wpifycf-field-cloudflare__connected-info">
        <span className="wpifycf-field-cloudflare__connected-zone">{value.zone_name}</span>
        <span className="wpifycf-field-cloudflare__connected-account">{value.account_name}</span>
        <span className="wpifycf-field-cloudflare__connected-status">
          {__('Connected', 'wpify-custom-fields')}
        </span>
      </div>
      <Button onClick={onDisconnect} disabled={disabled}>
        {__('Disconnect', 'wpify-custom-fields')}
      </Button>
    </div>
  );
}

export function Cloudflare ({
  id,
  value = {},
  onChange,
  className,
  disabled = false,
  setTitle,
}) {
  const currentValue = { ...defaultValue, ...value };
  const [view, setView] = useState(currentValue.zone_id ? 'connected' : 'disconnected');
  const [email, setEmail] = useState(currentValue.email);
  const [apiKey, setApiKey] = useState(currentValue.api_key);

  useEffect(() => {
    if (typeof setTitle === 'function') {
      setTitle(currentValue.zone_name || '');
    }
  }, [setTitle, currentValue.zone_name]);

  const handleConnect = useCallback(() => {
    setEmail(currentValue.email || '');
    setApiKey(currentValue.api_key || '');
    setView('credentials');
  }, [currentValue.email, currentValue.api_key]);

  const handleCancel = useCallback(() => {
    setView(currentValue.zone_id ? 'connected' : 'disconnected');
  }, [currentValue.zone_id]);

  const handleValidate = useCallback(() => {
    setView('zones');
  }, []);

  const handleSelectZone = useCallback((zone) => {
    onChange({
      email,
      api_key: apiKey,
      zone_id: zone.zone_id,
      zone_name: zone.zone_name,
      account_id: zone.account_id,
      account_name: zone.account_name,
    });
    setView('connected');
  }, [onChange, email, apiKey]);

  const handleDisconnect = useCallback(() => {
    onChange({ ...defaultValue });
    setEmail('');
    setApiKey('');
    setView('disconnected');
  }, [onChange]);

  const handleBackToCredentials = useCallback(() => {
    setView('credentials');
  }, []);

  return (
    <div className={clsx('wpifycf-field-cloudflare', `wpifycf-field-cloudflare--${id}`, className)}>
      {view === 'disconnected' && (
        <DisconnectedView onConnect={handleConnect} disabled={disabled} />
      )}
      {view === 'credentials' && (
        <CredentialsView
          email={email}
          apiKey={apiKey}
          onEmailChange={setEmail}
          onApiKeyChange={setApiKey}
          onValidate={handleValidate}
          onCancel={handleCancel}
          disabled={disabled}
        />
      )}
      {view === 'zones' && (
        <ZoneListView
          email={email}
          apiKey={apiKey}
          onSelect={handleSelectZone}
          onBack={handleBackToCredentials}
          disabled={disabled}
        />
      )}
      {view === 'connected' && (
        <ConnectedView
          value={currentValue}
          onDisconnect={handleDisconnect}
          disabled={disabled}
        />
      )}
    </div>
  );
}

Cloudflare.checkValidity = function (value, field) {
  const validity = [];

  if (field.required && (!value || !value.zone_id)) {
    validity.push(__('This field is required.', 'wpify-custom-fields'));
  }

  return validity;
};

export default Cloudflare;
