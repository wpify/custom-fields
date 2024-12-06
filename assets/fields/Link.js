import { useCallback, useEffect, useState } from 'react';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { normalizeUrl, stripHtml } from '@/helpers/functions'
import { usePostTypes, useUrlTitle } from '@/helpers/hooks';
import { PostSelect } from '@/components/PostSelect';
import clsx from 'clsx';
import { checkValidityLinkType } from '@/helpers/validators';

export function Link ({
  id,
  htmlId,
  value = {},
  onChange,
  post_type,
  className,
  disabled = false,
  setTitle,
}) {
  const [blurUrl, setBlurUrl] = useState(null);
  const postTypes = usePostTypes(post_type);
  const defaultValue = {
    target: null,
    post: null,
    post_type: null,
    label: null,
    url: null,
  };

  const generateTitle = useCallback((value) => {
    const parts = [];
    if (value.label) {
      parts.push(stripHtml(value.label));
    }
    if (value.url) {
      parts.push(`(${value.url})`);
    }
    return parts.join(' ');
  }, []);

  const handlePostChange = useCallback(option => {
    if (typeof option !== 'undefined' && option?.id !== value.post) {
      const nextValue = {
        ...defaultValue,
        ...value,
        post: option?.id,
        label: option?.title,
        url: option?.permalink,
      };
      onChange(nextValue);
      setTitle(generateTitle(nextValue));
    }
  }, [onChange, setTitle, value]);

  const handleUrlChange = useCallback(event => {
    const nextValue = {
      ...defaultValue,
      ...value,
      url: event.target.value,
    };
    onChange(nextValue);
    setTitle(generateTitle(nextValue));
  }, [onChange, setTitle, value]);

  const handleTargetChange = useCallback(event => {
    onChange({
      ...defaultValue,
      ...value,
      target: event.target.checked ? '_blank' : null,
    });
  }, [onChange, value]);

  const handleLabelChange = useCallback(event => {
    const nextValue = {
      ...defaultValue,
      ...value,
      label: event.target.value,
    };
    onChange(nextValue);
    setTitle(generateTitle(nextValue));
  }, [onChange, value]);

  const handlePostTypeChange = useCallback(event => {
    const nextValue = {
      ...defaultValue,
      ...value,
      post_type: event.target.value,
      post: null,
      url: null,
      label: null,
    };
    onChange(nextValue);
    setTitle(generateTitle(nextValue));
  }, [onChange, value]);

  const handleUrlBlur = useCallback((event) => {
    const normalizedUrl = normalizeUrl(event.target.value);
    setBlurUrl(normalizedUrl);
    if (value?.url !== normalizedUrl) {
      const nextValue = {
        ...defaultValue,
        ...value,
        url: normalizedUrl
      };
      onChange(nextValue);
      setTitle(generateTitle(nextValue));
    }
  }, [onChange, value]);

  const resolvedUrlTitle = useUrlTitle(blurUrl);

  useEffect(() => {
    if (blurUrl && resolvedUrlTitle.data && !value.label) {
      const nextValue = {
        ...defaultValue,
        ...value,
        label: resolvedUrlTitle.data,
      };
      onChange(nextValue);
      setBlurUrl(null);
      setTitle(generateTitle(nextValue));
    }
  }, [resolvedUrlTitle, onChange, value.label, blurUrl]);

  return (
    <div className={clsx('wpifycf-field-link', `wpifycf-field-link--${id}`, className)}>
      <div className="wpifycf-field-link__fields">
        <div className="wpifycf-field-link__field-label">
          {postTypes.length > 0 ? (
            <PostTypes
              value={value}
              postTypes={postTypes}
              onChange={handlePostTypeChange}
              disabled={disabled}
            />
          ) : (
            <label htmlFor={htmlId + '.url'}>
              {__('URL', 'wpify-custom-fields')}
            </label>
          )}
        </div>
        <div className="wpifycf-field-link__field-input">
          {value.post_type && (
            <PostSelect
              postType={value.post_type}
              value={value.post}
              onSelect={handlePostChange}
              disabled={disabled}
            />
          )}
          <UrlInput
            value={value}
            htmlId={htmlId}
            onUrlChange={handleUrlChange}
            onBlur={handleUrlBlur}
            onTargetChange={handleTargetChange}
            disabled={disabled}
          />
        </div>
        <div className="wpifycf-field-link__field-label">
          <label htmlFor={htmlId + '.label'}>
            {__('Label', 'wpify-custom-fields')}
          </label>
        </div>
        <div className="wpifycf-field-link__field-input">
          <input type="text" value={value?.label || ''} id={htmlId + '.label'} onChange={handleLabelChange} disabled={disabled} />
        </div>
      </div>
    </div>
  );
}

function PostTypes ({ onChange, postTypes, value, disabled }) {
  return (
    <select value={value.post_type} onChange={onChange} disabled={disabled}>
      <option value="">{__('URL', 'wpify-custom-fields')}</option>
      {postTypes.map((currentPostType) => (
        <option value={currentPostType.slug} key={currentPostType.slug}>
          {currentPostType.labels.singular_name}
        </option>
      ))}
    </select>
  );
}

function UrlInput ({ value = {}, htmlId, onUrlChange, onTargetChange, onBlur, disabled }) {
  return (
    <div className="wpifycf-field-link__url-input">
      <input
        type="url"
        disabled={disabled}
        value={value.url || ''}
        id={htmlId + '.url'}
        onChange={onUrlChange}
        onBlur={onBlur}
      />
      <label className="wpifycf-field-link__field-option">
        <input
          type="checkbox"
          disabled={disabled}
          checked={value.target === '_blank'}
          onChange={onTargetChange}
        />
        {__('Open in a new tab', 'wpify-custom-fields')}
      </label>
    </div>
  );
}

Link.checkValidity = checkValidityLinkType;

addFilter('wpifycf_field_link', 'wpify_custom_fields', () => Link);
