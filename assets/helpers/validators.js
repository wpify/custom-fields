import { __ } from '@wordpress/i18n';
import { getFieldComponentByType } from '@/helpers/functions';

export function stringRequired (value) {
  return typeof value === 'string' && value.trim() !== '';
}

export function checkValidityStringType (value, field) {
  const validity = [];

  if (field.required && !stringRequired(value)) {
    validity.push(__('This field is required.', 'wpify-custom-fields'));
  }

  return validity;
}

export function checkValidityNonZeroIntegerType (value, field) {
  const validity = [];

  if (field.required && !(parseInt(value) > 0)) {
    validity.push(__('This field is required.', 'wpify-custom-fields'));
  }

  return validity;
}

export function checkValidityBooleanType (value, field) {
  const validity = [];

  if (field.required && !Boolean(value)) {
    validity.push(__('This field is required.', 'wpify-custom-fields'));
  }

  return validity;
}

export function checkValidityDateTimeType (value, field) {
  const validity = [];

  if (field.required && !stringRequired(value)) {
    validity.push(__('This field is required.', 'wpify-custom-fields'));
  }

  return validity;
}

export function checkValidityEmailType (value, field) {
  const validity = [];

  if (field.required && !stringRequired(value)) {
    validity.push(__('This field is required.', 'wpify-custom-fields'));
  }

  if (stringRequired(value) && !/^.+@.+\..+$/.test(value)) {
    validity.push(__('This field must be a valid email address.', 'wpify-custom-fields'));
  }

  return validity;
}

export function checkValidityGroupType (value = {}, field) {
  const validity = [];

  if (Array.isArray(field.items)) {
    field.items.forEach(item => {
      const FieldComponent = getFieldComponentByType(item.type);

      if (typeof FieldComponent.checkValidity === 'function') {
        const fieldValidity = FieldComponent.checkValidity(value[item.id], item);

        if (fieldValidity.length > 0) {
          validity.push({ [item.id]: fieldValidity });
        }
      }
    });
  }

  return validity;
}

export function checkValidityMultiGroupType (value, field) {
  const validity = [];

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const itemValidity = checkValidityGroupType(item, field);

      if (itemValidity.length > 0) {
        validity.push({ [index]: itemValidity });
      }
    });
  }

  return validity;
}

export function checkValidityMultiFieldType (type) {
  return (value, field) => {
    const validity = [];

    if (field.required && (!Array.isArray(value) || value.length === 0)) {
      validity.push(__('This field is required.', 'wpify-custom-fields'));
    }

    if (Array.isArray(value)) {
      const FieldComponent = getFieldComponentByType(type);

      value.forEach((item, index) => {
        if (typeof FieldComponent.checkValidity === 'function') {
          const itemValidity = FieldComponent.checkValidity(item, field);

          if (itemValidity.length > 0) {
            validity.push({ [index]: itemValidity });
          }
        }
      });
    }

    return validity;
  };
}

export function checkValidityMultiBooleanType (value, field) {
  const validity = [];

  if (field.required && (typeof value !== 'object' || (!Object.keys(value).map(key => value[key]).some(Boolean)))) {
    validity.push(__('This field is required.', 'wpify-custom-fields'));
  }

  return validity;
}

export function checkValidityNumberType (value, field) {
  const validity = [];

  if (field.required && isNaN(value)) {
    validity.push(__('This field is required.', 'wpify-custom-fields'));
  }

  if (field.required && isNaN(parseFloat(value))) {
    validity.push(__('This field must be a number.', 'wpify-custom-fields'));
  }

  if (field.min && parseFloat(value) < field.min) {
    validity.push(__('This field must be greater than or equal to the minimum value.', 'wpify-custom-fields'));
  }

  if (field.max && parseFloat(value) > field.max) {
    validity.push(__('This field must be less than or equal to the maximum value.', 'wpify-custom-fields'));
  }

  if (field.step && parseFloat(value) % field.step !== 0) {
    validity.push(__('This field must be a multiple of the step value.', 'wpify-custom-fields'));
  }

  return validity;
}

export function checkValidityLinkType (value, field) {
  const validity = [];

  if (field.required && !(typeof value === 'object' && (value.url || value.post)) || typeof value !== 'object') {
    validity.push(__('This field is required.', 'wpify-custom-fields'));
  }

  return validity;
}

export function checkValidityMultiNonZeroType (value, field) {
  const validity = [];

  if (field.required && (!Array.isArray(value) || !value.every(v => v > 0) || value.length === 0)) {
    validity.push(__('This field is required.', 'wpify-custom-fields'));
  }

  return validity;
}

export function checkValidityMultiStringType (value, field) {
  const validity = [];

  if (field.required && !(Array.isArray(value) && value.every(v => stringRequired(v)))) {
    validity.push(__('This field is required.', 'wpify-custom-fields'));
  }

  return validity;
}

export function checkValidityDateRangeType (value, field) {
  const validity = [];

  // Check required
  if (field.required && (!value || (!value[0] && !value[1]))) {
    validity.push(__('This field is required.', 'wpify-custom-fields'));
    return validity;
  }

  // If both dates provided, check order
  if (value && value[0] && value[1]) {
    const startDate = new Date(value[0]);
    const endDate = new Date(value[1]);
    if (startDate > endDate) {
      validity.push(__('The start date must be before or equal to the end date.', 'wpify-custom-fields'));
    }
  }

  // Check min constraint
  if (value && field.min) {
    const minDate = new Date(field.min);
    if (value[0] && new Date(value[0]) < minDate) {
      validity.push(__('The start date must not be before the minimum date.', 'wpify-custom-fields'));
    }
    if (value[1] && new Date(value[1]) < minDate) {
      validity.push(__('The end date must not be before the minimum date.', 'wpify-custom-fields'));
    }
  }

  // Check max constraint
  if (value && field.max) {
    const maxDate = new Date(field.max);
    if (value[0] && new Date(value[0]) > maxDate) {
      validity.push(__('The start date must not be after the maximum date.', 'wpify-custom-fields'));
    }
    if (value[1] && new Date(value[1]) > maxDate) {
      validity.push(__('The end date must not be after the maximum date.', 'wpify-custom-fields'));
    }
  }

  return validity;
}
