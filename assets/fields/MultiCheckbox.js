import { useCallback } from 'react'
import { addFilter } from '@wordpress/hooks'
import { checkValidityMultiBooleanType } from '@/helpers/validators'
import clsx from 'clsx'

function MultiCheckbox ({
  id,
  htmlId,
  onChange,
  value = [],
  options,
  attributes = {},
  disabled = false,
  className,
}) {
  const handleChange = useCallback(optionValue => event => {
    const nextValue = Array.isArray(value) ? [...value] : []

    if (event.target.checked) {
      nextValue.push(optionValue)
    } else {
      nextValue.splice(nextValue.indexOf(optionValue), 1)
    }

    onChange(nextValue.filter((value, index, array) => array.indexOf(value) === index))
  }, [onChange, value])

  return (<div className={clsx('wpifycf-field-multi-checkbox', `wpifycf-field-multi-checkbox--${id}`, className)}>
    {options.map(option => (
      <div
        className={`wpifycf-field-multi-checkbox__item wpifycf-field-multi-checkbox__item--${option.value}`}
        key={option.value}>
        <input
          type="checkbox"
          id={`${htmlId}-${option.value}`}
          onChange={handleChange(option.value)}
          checked={Array.isArray(value) ? value.includes(option.value) : false}
          disabled={disabled || option.disabled}
          {...attributes}
        />
        <label
          className="wpifycf-field-multi-checkbox__label"
          htmlFor={`${htmlId}-${option.value}`}
          dangerouslySetInnerHTML={{ __html: option.label }}
        />
      </div>
    ))}
  </div>)
}

MultiCheckbox.checkValidity = checkValidityMultiBooleanType

export default MultiCheckbox
