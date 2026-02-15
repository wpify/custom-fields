# Validation

WPify Custom Fields includes a real-time client-side validation system. Fields are validated as users type or change values, and error messages are displayed immediately without requiring a page reload.

## Overview

Each field component can define a static `checkValidity(value, field)` method that receives the current value and field configuration and returns an array of error message strings. An empty array means the value is valid.

## How It Works

1. The `Field` component calls `FieldComponent.checkValidity(value, field)` whenever the value or field configuration changes.
2. The returned array of error strings is stored in state and displayed below the field.
3. Hidden fields (via conditions or tabs) skip validation — they always return an empty array.
4. Validation runs on every value change, providing real-time feedback.

```js
// Simplified internal logic
const validity = useMemo(
  () => !isHidden && typeof FieldComponent.checkValidity === 'function'
    ? FieldComponent.checkValidity( value, { ...props, type } )
    : [],
  [ FieldComponent, value, props, type, isHidden ],
);
```

## Built-in Validators

The following validator functions are available in `assets/helpers/validators.js`:

| Validator | What It Checks | Error Messages | Used By |
|---|---|---|---|
| `checkValidityStringType` | Required string is non-empty | "This field is required." | Text, Textarea, Password, URL, Tel, Hidden |
| `checkValidityEmailType` | Required + valid email format | "This field is required.", "This field must be a valid email address." | Email |
| `checkValidityNumberType` | Required, is number, min/max/step | "This field is required.", "This field must be a number.", min/max/step messages | Number, Range |
| `checkValidityBooleanType` | Required boolean is truthy | "This field is required." | Checkbox, Toggle |
| `checkValidityDateTimeType` | Required date/time is non-empty | "This field is required." | Date, Datetime, Time, Month, Week |
| `checkValidityDateRangeType` | Required, date order, min/max bounds | "This field is required.", "The start date must be before or equal to the end date.", min/max date messages | Date Range |
| `checkValidityNonZeroIntegerType` | Required integer > 0 | "This field is required." | Post, Attachment |
| `checkValidityLinkType` | Required link has URL or post | "This field is required." | Link |
| `checkValidityGroupType` | Recursively validates all children | Per-child errors | Group |
| `checkValidityMultiGroupType` | Validates each item as a group | Per-item, per-child errors | Multi Group |
| `checkValidityMultiFieldType` | Required array is non-empty, validates each item | "This field is required." + per-item errors | Multi Text, Multi Email, Multi Date, etc. |
| `checkValidityMultiBooleanType` | Required object has at least one truthy value | "This field is required." | Multi Checkbox, Multi Toggle |
| `checkValidityMultiNonZeroType` | Required array of integers > 0 | "This field is required." | Multi Post, Multi Attachment, Multi Term |
| `checkValidityMultiStringType` | Required array of non-empty strings | "This field is required." | Multi URL, Multi Tel |

## Validation in Groups

The `checkValidityGroupType` function recursively validates all child fields within a group. It uses `flattenWrapperItems()` to hoist wrapper children to the same level before validation, ensuring wrapper fields are transparent to the validation system.

```js
function checkValidityGroupType( value = {}, field ) {
  const validity = [];

  if ( Array.isArray( field.items ) ) {
    flattenWrapperItems( field.items ).forEach( item => {
      const FieldComponent = getFieldComponentByType( item.type );

      if ( typeof FieldComponent.checkValidity === 'function' ) {
        const fieldValidity = FieldComponent.checkValidity( value[ item.id ], item );

        if ( fieldValidity.length > 0 ) {
          validity.push( { [ item.id ]: fieldValidity } );
        }
      }
    } );
  }

  return validity;
}
```

The returned validity is an array of objects, where each object maps a child field ID to its error messages.

## Validation in Multi-Fields

The `checkValidityMultiFieldType(type)` is a factory function that creates a validator for any repeatable field type. It:

1. Checks if the array itself is required and non-empty.
2. Iterates over each item in the array and validates it using the base field type's `checkValidity` method.

```js
function checkValidityMultiFieldType( type ) {
  return ( value, field ) => {
    const validity = [];

    if ( field.required && ( ! Array.isArray( value ) || value.length === 0 ) ) {
      validity.push( __( 'This field is required.', 'wpify-custom-fields' ) );
    }

    if ( Array.isArray( value ) ) {
      const FieldComponent = getFieldComponentByType( type );

      value.forEach( ( item, index ) => {
        if ( typeof FieldComponent.checkValidity === 'function' ) {
          const itemValidity = FieldComponent.checkValidity( item, field );

          if ( itemValidity.length > 0 ) {
            validity.push( { [ index ]: itemValidity } );
          }
        }
      } );
    }

    return validity;
  };
}
```

## Custom Validators

To add validation to a custom field component, define a static `checkValidity` method on the component:

```js
function MyCustomField( { id, value, onChange, ...props } ) {
  // Field render logic
  return <input value={value} onChange={e => onChange( e.target.value )} />;
}

MyCustomField.checkValidity = function( value, field ) {
  const errors = [];

  if ( field.required && ! value ) {
    errors.push( __( 'This field is required.', 'my-plugin' ) );
  }

  if ( value && value.length < 3 ) {
    errors.push( __( 'Value must be at least 3 characters.', 'my-plugin' ) );
  }

  return errors;
};
```

The validation system will automatically pick up your `checkValidity` method and call it whenever the field value changes.

## Notes

- Validation is client-side only. Server-side sanitization is handled separately via the `wpifycf_sanitize_{type}` PHP filters.
- Hidden fields (hidden by conditions or not on the active tab) are not validated.
- The validation result is an array of strings for simple fields, or an array of strings and objects for compound fields (groups, multi-fields). Objects map child IDs or indices to their respective error arrays.
