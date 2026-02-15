import { useCallback, useMemo } from 'react'
import { addFilter } from '@wordpress/hooks'
import { ToggleControl } from '@wordpress/components'
import { checkValidityMultiBooleanType } from '@/helpers/validators'
import { useFieldTitle } from '@/helpers/hooks'
import { stripHtml } from '@/helpers/functions'
import clsx from 'clsx'

function MultiToggle ({
  id,
  htmlId,
  onChange,
  value = [],
  options,
  className,
  disabled = false,
  setTitle,
}) {
  const titleValue = useMemo(() => {
    if (!Array.isArray(value) || value.length === 0 || !options) return '';
    return value
      .map(v => options.find(o => o.value === v))
      .filter(Boolean)
      .map(o => stripHtml(o.label))
      .join(', ');
  }, [value, options]);
  useFieldTitle(setTitle, titleValue);
  const handleChange = useCallback(optionValue => checked => {
    const nextValue = Array.isArray(value) ? [...value] : []

    if (checked) {
      nextValue.push(optionValue)
    } else {
      nextValue.splice(nextValue.indexOf(optionValue), 1)
    }

    onChange(nextValue.filter((value, index, array) => array.indexOf(value) === index))
  }, [onChange, value])

  return (
    <div className={clsx('wpifycf-field-multi-toggle', `wpifycf-field-multi-toggle--${id}`, className)}>
      {options.map(option => (
        <div
          className={`wpifycf-field-multi-toggle__item wpifycf-field-multi-checkbox__item--${option.value}`}
          key={option.value}
        >
          <ToggleControl
            id={`${htmlId}-${option.value}`}
            onChange={handleChange(option.value)}
            checked={Array.isArray(value) ? value.includes(option.value) : false}
            disabled={disabled || option.disabled}
            label={<span dangerouslySetInnerHTML={{ __html: option.label }}/>}
          />
        </div>
      ))}
    </div>
  )
}

MultiToggle.checkValidity = checkValidityMultiBooleanType

export default MultiToggle;
