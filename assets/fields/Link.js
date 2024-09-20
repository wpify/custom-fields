import { useCallback, useEffect, useMemo, useState } from 'react';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import '@wordpress/core-data';
import { isValidUrl, normalizeUrl } from '@/helpers/functions';
import { usePost, usePostTypes, useUrlTitle } from '@/helpers/hooks';
import PostSelect from '@/components/PostSelect';

export function Link ({ name, htmlId, value = {}, onChange, post_type }) {
  const [blurUrl, setBlurUrl] = useState(null);
  const postTypes = usePostTypes(post_type);

  const handlePostChange = useCallback(post => {
    onChange({
      ...value,
      post,
    });
  }, [onChange, value]);

  const handleUrlChange = useCallback(event => {
    onChange({
      ...value,
      url: event.target.value,
    });
  }, [onChange, value]);

  const handleTargetChange = useCallback(event => {
    onChange({
      ...value,
      target: event.target.checked ? '_blank' : null,
    });
  }, [onChange, value]);

  const handleLabelChange = useCallback(event => {
    onChange({
      ...value,
      label: event.target.value,
    });
  }, [onChange, value]);

  const handlePostTypeChange = useCallback(event => {
    onChange({
      ...value,
      post_type: event.target.value,
      post: null,
      url: null,
    });
  }, [onChange, value]);

  const isValueUrlValid = useMemo(() => {
    return isValidUrl(value.url);
  }, [value.url]);

  const handleUrlBlur = useCallback((event) => {
    const normalizedUrl = normalizeUrl(event.target.value);
    setBlurUrl(normalizedUrl);
    if (value?.url !== normalizedUrl) {
      onChange({ ...value, url: normalizedUrl });
    }
  }, [onChange, value]);

  const resolvedUrlTitle = useUrlTitle(blurUrl);

  useEffect(() => {
    if (blurUrl && resolvedUrlTitle.data && !value.label) {
      onChange({
        ...value,
        label: resolvedUrlTitle.data,
      });
      setBlurUrl(null);
    }
  }, [resolvedUrlTitle, onChange, value.label, blurUrl]);

  return (
    <span className="wpifycf-field-link">
      {name && (
        <input type="hidden" value={JSON.stringify(value)} name={name} />
      )}
      <span className="wpifycf-field-link__fields">
        <span className="wpifycf-field-link__field-label">
          {postTypes.length > 0 ? (
            <select value={value.post_type} onChange={handlePostTypeChange}>
              <option value="">{__('URL', 'wpify-custom-fields')}</option>
              {postTypes.map((currentPostType) => (
                <option value={currentPostType.slug}>
                  {currentPostType.labels.singular_name}
                </option>
              ))}
            </select>
          ) : (
            <label htmlFor={htmlId + '.url'}>
              {__('URL', 'wpify-custom-fields')}
            </label>
          )}
        </span>
        <span className="wpifycf-field-link__field-value">
          {value.post_type ? (
            <PostSelect postType={value.post_type} value={value.post} onChange={handlePostChange} />
          ) : (
            <input type="url" value={value?.url || ''} id={htmlId + '.url'} onChange={handleUrlChange} onBlur={handleUrlBlur} />
          )}
          {isValueUrlValid && (
            <label className="wpifycf-field-link__field-option">
              <input type="checkbox" value={value?.target === '_blank'} onChange={handleTargetChange} />
              {__('Open in a new tab', 'wpify-custom-fields')}
            </label>
          )}
        </span>
        <label className="wpifycf-field-link__field-label" htmlFor={htmlId + '.label'}>
          {__('Label', 'wpify-custom-fields')}
        </label>
        <span className="wpifycf-field-link__field-value">
          <input type="text" value={value?.label || ''} id={htmlId + '.label'} onChange={handleLabelChange} />
        </span>
    </span>
  </span>
  );
}

addFilter('wpifycf_field_link', 'wpify_custom_fields', () => Link);
