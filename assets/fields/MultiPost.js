import { addFilter } from '@wordpress/hooks';
import { useCallback, useEffect } from 'react';
import { __, _n, sprintf } from '@wordpress/i18n';
import { PostSelect } from '@/components/PostSelect';
import { PostPreview } from '@/fields/Post';
import { useMulti, usePosts, useFieldTitle } from '@/helpers/hooks';
import { checkValidityMultiNonZeroType } from '@/helpers/validators';
import clsx from 'clsx';

export function MultiPost ({
  id,
  value = [],
  onChange,
  post_type: postType,
  className,
  disabled = false,
  setTitle,
}) {
  useFieldTitle(setTitle, Array.isArray(value) && value.length > 0 ? sprintf(_n('%d post', '%d posts', value.length, 'wpify-custom-fields'), value.length) : '');

  useEffect(() => {
    if (!Array.isArray(value)) {
      onChange([]);
    }
  }, [value, onChange]);

  const handleAdd = useCallback(newValue => onChange([newValue, ...value]), [onChange, value]);

  const { data: posts } = usePosts({
    postType: postType,
    enabled: Array.isArray(value) && value.length > 0,
    include: Array.isArray(value) ? [...value].sort() : [],
  });

  const { containerRef, remove } = useMulti({
    value,
    onChange,
    disabled,
  });

  return (
    <div className={clsx('wpifycf-field-multi-post', `wpifycf-field-multi-post--${id}`, className)}>
      {!disabled && (
        <PostSelect
          value={null}
          exclude={value}
          onChange={handleAdd}
          postType={postType}
        />
      )}
      <div className="wpifycf-field-multi-post__items" ref={containerRef}>
        {Array.isArray(value) && value.map((id, index) => (
          <PostPreview
            key={index + '-' + id}
            post={posts.find(post => post.id === id)}
            onDelete={remove(index)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

MultiPost.checkValidity = checkValidityMultiNonZeroType;

export default MultiPost;
