import { useCallback, useEffect, useState } from 'react';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { normalizeUrl } from '@/helpers/functions';
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
}) {
  const [blurUrl, setBlurUrl] = useState(null);
  const postTypes = usePostTypes(post_type);

  const handlePostChange = useCallback(option => {
    if (typeof option !== 'undefined' && option?.id !== value.post) {
      onChange({
        ...value,
        post: option?.id,
        label: option?.title,
        url: option?.permalink,
      });
    }
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
      label: null,
    });
  }, [onChange, value]);

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
    <span className={clsx('wpifycf-field-link', `wpifycf-field-link--${id}`, className)}>
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
        {value.post_type && (
          <PostSelect postType={value.post_type} value={value.post} onSelect={handlePostChange} />
        )}
		<span className={`wpifycf-field-link__field-value${value.post_type ? ' wpifycf-field-link__field-value-col-span-2' : ''}`}>
          {value.post_type && (
            <label htmlFor={htmlId + '.url'}>
              {__('URL', 'wpify-custom-fields')}
            </label>
          )}
          <input type="url" value={value?.url || ''} id={htmlId + '.url'} onChange={handleUrlChange} onBlur={handleUrlBlur} />
          <label className="wpifycf-field-link__field-option">
            <input type="checkbox" checked={value?.target === '_blank'} onChange={handleTargetChange} />
            {__('Open in a new tab', 'wpify-custom-fields')}
          </label>
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

Link.checkValidity = checkValidityLinkType;

addFilter('wpifycf_field_link', 'wpify_custom_fields', () => Link);
