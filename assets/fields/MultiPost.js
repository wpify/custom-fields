import { addFilter } from '@wordpress/hooks';
import { useCallback } from 'react';
import { PostSelect } from '@/components/PostSelect';
import { PostPreview } from '@/fields/Post';
import { useMulti, usePosts } from '@/helpers/hooks';

export function MultiPost ({ name, value = [], onChange, post_type: postType }) {
  if (!Array.isArray(value)) {
    value = [];
  }

  const handleAdd = useCallback(newValue => onChange([newValue, ...value]), [onChange, value]);
  const { data: posts } = usePosts({
    postType: postType,
    enabled: value.length > 0,
    include: [...value].sort(),
  });

  const { containerRef, remove } = useMulti({
    value,
    onChange,
  });

  return (
    <span className="wpifycf-field-multi-post">
      {name && (
        <input type="hidden" name={name} value={JSON.stringify(value)} />
      )}
      <PostSelect
        value={null}
        exclude={value}
        onChange={handleAdd}
        postType={postType}
      />
      <span className="wpifycf-field-multi-post__items" ref={containerRef}>
        {value.map((id, index) => (
          <PostPreview
            key={index + '-' + id}
            post={posts.find(post => post.id === id)}
            onDelete={remove(index)}
          />
        ))}
      </span>
    </span>
  );
}

addFilter('wpifycf_field_multi_post', 'wpify_custom_fields', () => MultiPost);
