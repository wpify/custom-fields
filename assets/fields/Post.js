import { useCallback, useState } from 'react';
import { addFilter } from '@wordpress/hooks';
import { PostSelect } from '@/components/PostSelect';
import { IconButton } from '@/components/IconButton';

export function Post ({ name, value, onChange, post_type: postType }) {
  const [selected, setSelected] = useState(null);

  const handleDelete = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <span className="wpifycf-field-post">
      {name && (
        <input type="hidden" name={name} value={value} />
      )}
      <PostSelect
        value={value}
        onChange={onChange}
        onSelect={setSelected}
        postType={postType}
      />
      {selected && (
        <PostPreview post={selected} onDelete={handleDelete} />
      )}
    </span>
  );
}

export function PostPreview ({ post, onDelete }) {
  return (
    <span className="wpifycf-post-preview">
      {post && (
        <>
          <img
            src={post.thumbnail}
            alt={post.title}
            className="wpifycf-post-preview__thumbnail"
            loading="lazy"
            width="100"
            height="100"
          />
          <span className="wpifycf-post-preview__title">
            <a href={post.permalink} target="_blank">
              {post.id}: {post.title}
            </a>
          </span>
          <span className="wpifycf-post-preview__excerpt">{post.excerpt.length > 125 ? post.excerpt.substring(0, 125) + '...' : post.excerpt}</span>
        </>
      )}
      <IconButton icon="trash" className="wpifycf-post-preview__delete" onClick={onDelete} />
    </span>
  );
}

addFilter('wpifycf_field_post', 'wpify_custom_fields', () => Post);
