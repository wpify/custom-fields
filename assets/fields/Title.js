import { addFilter } from '@wordpress/hooks';

function Title ({ title, description }) {
  return (
    <span className="wpify-field-title">
      {title && <h2 dangerouslySetInnerHTML={{ __html: title }} />}
      {description && <p dangerouslySetInnerHTML={{ __html: description }} />}
    </span>
  );
}

Title.renderOptions = {
  noWrapper: true,
  noLabel: true,
};

addFilter('wpifycf_field_title', 'wpify_custom_fields', () => Title);
