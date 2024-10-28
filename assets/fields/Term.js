import { addFilter } from '@wordpress/hooks';
import { useTerms } from '@/helpers/hooks';
import React, { useState, useEffect, useCallback } from 'react';
import { IconButton } from '@/components/IconButton';
import { Select } from '@/fields/Select';
import { __ } from '@wordpress/i18n';
import { checkValidityNonZeroIntegerType } from '@/helpers/validators';
import clsx from 'clsx';

function isTermExpanded (category, value) {
  return category.children
    ? category.children.some(child => value.includes(child.id) || isTermExpanded(child, value))
    : false;
}

export function Term ({
  taxonomy,
  id,
  htmlId,
  value = 0,
  onChange,
  className,
  disabled = false,
}) {
  const { data: terms, isError, isFetching } = useTerms({ taxonomy });

  let content;

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
        disabled={disabled}
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
        disabled={disabled}
      />
    );
  }

  return (
    <div className={clsx('wpifycf-field-term', `wpifycf-field-term--${id}`, className)}>
      {content}
    </div>
  );
}

Term.checkValidity = checkValidityNonZeroIntegerType;

export function CategoryTree ({ categories = [], value = [], onChange, htmlId, type, disabled = false }) {
  return (
    <div className="wpifycf-term-items">
      {categories.map(category => (
        <CategoryItem
          key={category.id}
          category={category}
          value={value}
          onChange={onChange}
          htmlId={htmlId + '__select'}
          type={type}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function CategoryItem ({ htmlId, category, value = [], onChange, type, disabled = false }) {
  const [isExpanded, setIsExpanded] = useState(() => isTermExpanded(category, value));

  useEffect(() => {
    setIsExpanded(prev => prev ? prev : isTermExpanded(category, value));
  }, [category, value]);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleSelect = useCallback(id => () => {
    if (disabled) {
      return null;
    } else if (type === 'radio') {
      onChange(id);
    } else if (type === 'checkbox') {
      if (value.includes(id)) {
        onChange(value.filter(cid => id !== cid));
      } else {
        onChange([...value, id]);
      }
    }
  }, [type, onChange, value]);

  return (
    <div className="wpifycf-term-item">
      <div className="wpifycf-term-item__name">
        <input
          type={type}
          name={htmlId}
          onChange={handleSelect(category.id)}
          checked={value.includes(category.id)}
          disabled={disabled}
        />
        <div
          onClick={category.children ? handleToggleExpanded : handleSelect(category.id)}
          dangerouslySetInnerHTML={{ __html: category.name }}
        />
        {category.children && (
          <IconButton
            icon={isExpanded ? 'minus' : 'plus'}
            onClick={handleToggleExpanded}
          />
        )}
      </div>
      {isExpanded && category.children && (
        <div className="wpifycf-term-item__children">
          {category.children.map(child => (
            <CategoryItem
              key={child.id}
              category={child}
              value={value}
              onChange={onChange}
              type={type}
              htmlId={htmlId}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

addFilter('wpifycf_field_term', 'wpify_custom_fields', () => Term);
