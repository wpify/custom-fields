import { addFilter } from '@wordpress/hooks';
import { ToggleControl } from '@wordpress/components';

function Toggle ({ htmlId, name, value, item_label, onChange }) {
  return (
    <>
      {name && (
        <input
          type="hidden"
          name={name}
          value={value}
        />
      )}
      <ToggleControl
        id={htmlId}
        label={item_label}
        checked={value}
        onChange={onChange}
      />
    </>
  );
}

addFilter('wpifycf_field_toggle', 'wpify_custom_fields', () => Toggle);
