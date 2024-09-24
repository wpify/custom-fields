import { addFilter } from '@wordpress/hooks';
import { useTerms } from '@/helpers/hooks';
import React, { useState, useEffect, useCallback } from 'react';
import { IconButton } from '@/components/IconButton';
import { Select } from '@/fields/Select';
import { __ } from '@wordpress/i18n';

function isCategoryExpanded (category, value) {
  if (value.includes(category.id)) {
    return true;
  }

  if (category.children) {
    return category.children.some(child => isCategoryExpanded(child, value));
  }

  return false;
}

export function Term ({ taxonomy, id, htmlId, name, value, onChange }) {
  const { data: terms, isLoading, isError, isFetching } = useTerms({ taxonomy });

  let content = '';

  if (isFetching) {
    content = __('Loading terms...', 'wpify-custom-fields');
  } else if (isError) {
    content = __('Error in loading terms...', 'wpify-custom-fields');
  } else if (terms.length === 0) {
    content = __('No terms found...', 'wpify-custom-fields');
  } else if (terms.some(term => term.children)) {
    content = (
      <CategoryTree
        categories={terms}
        value={[parseInt(value)]}
        onChange={onChange}
        type="radio"
        htmlId={htmlId}
      />
    );
  } else {
    content = (
      <Select
        id={id}
        htmlId={htmlId}
        value={value}
        onChange={onChange}
        options={terms.map(term => ({ value: term.id, label: term.name }))}
      />
    );
  }

  return (
    <span className="wpifycf-field-term">
      {name && <input type="hidden" name={name} value={value} />}
      {content}
    </span>
  );
}

export function CategoryTree ({ name, categories = [], value = [], onChange, htmlId, type }) {
  return (
    <span className="wpifycf-term-items">
      {categories.map(category => (
        <CategoryItem
          key={category.id}
          category={category}
          value={value}
          onChange={onChange}
          htmlId={htmlId + '__select'}
          type={type}
        />
      ))}
    </span>
  );
}

function CategoryItem ({ htmlId, category, value = [], onChange, type }) {
  const [isExpanded, setIsExpanded] = useState(() => isCategoryExpanded(category, value));

  useEffect(() => {
    setIsExpanded(prev => prev ? prev : isCategoryExpanded(category, value));
  }, [category, value]);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleSelect = useCallback(event => {
    if (type === 'radio') {
      onChange(category.id);
    } else if (type === 'checkbox') {
      onChange(
        event.target.checked
          ? [...value, category.id]
          : value.filter(id => id !== category.id),
      );
    }
  }, [type, onChange, category.id, value]);

  return (
    <span className="wpifycf-term-item">
      <span className="wpifycf-term-item__name">
        <input
          type={type}
          name={htmlId}
          onChange={handleSelect}
          checked={value.includes(category.id)}
        />
        <span
          onClick={handleToggleExpanded}
          dangerouslySetInnerHTML={{ __html: category.name }}
        />
        {category.children && (
          <IconButton
            icon={isExpanded ? 'minus' : 'plus'}
            onClick={handleToggleExpanded}
          />
        )}
      </span>
      {isExpanded && category.children && (
        <span className="wpifycf-term-item__children">
          {category.children.map(child => (
            <CategoryItem
              key={child.id}
              category={child}
              value={value}
              onChange={onChange}
              type={type}
              htmlId={htmlId}
            />
          ))}
        </span>
      )}
    </span>
  );
}

addFilter('wpifycf_field_term', 'wpify_custom_fields', () => Term);
