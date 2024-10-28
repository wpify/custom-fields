import { useCallback, useState } from 'react';
import { addFilter } from '@wordpress/hooks';
import { PostSelect } from '@/components/PostSelect';
import { IconButton } from '@/components/IconButton';
import { checkValidityNumberType } from '@/helpers/validators';
import clsx from 'clsx';
import defaultThumbnail from '@/images/placeholder-image.svg';

export function Post ({
  id,
  value = null,
  onChange,
  post_type: postType,
  className,
  disabled = false,
}) {
  const [selected, setSelected] = useState(null);
  const handleDelete = useCallback(() => onChange(null), [onChange]);

  return (
    <div className={clsx('wpifycf-field-post', `wpifycf-field-post--${id}`, className)}>
      <PostSelect
        value={value}
        onChange={onChange}
        onSelect={setSelected}
        postType={postType}
        disabled={disabled}
      />
      {value > 0 && (
        <PostPreview
          post={selected}
          onDelete={handleDelete}
          disabled={disabled}
        />
      )}
    </div>
  );
}

Post.checkValidity = checkValidityNumberType;

export function PostPreview ({ post, onDelete, disabled }) {
  return (
    <div className="wpifycf-post-preview">
      {post && (
        <>
          <img
            src={post.thumbnail || defaultThumbnail}
            alt={post.title}
            className="wpifycf-post-preview__thumbnail"
            loading="lazy"
            width="100"
            height="100"
          />
          <div className="wpifycf-post-preview__title">
            <a href={post.permalink} target="_blank">
              {post.id}: {post.title}
            </a>
          </div>
          <div className="wpifycf-post-preview__excerpt">{post.excerpt.length > 125 ? post.excerpt.substring(0, 125) + '...' : post.excerpt}</div>
        </>
      )}
      {!disabled && (
        <IconButton icon="trash" className="wpifycf-post-preview__delete" onClick={onDelete} />
      )}
    </div>
  );
}

addFilter('wpifycf_field_post', 'wpify_custom_fields', () => Post);
