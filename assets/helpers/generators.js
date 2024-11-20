import { v4 as uuidv4 } from 'uuid';
import { addFilter } from '@wordpress/hooks'

addFilter('wpifycf_generator_uuid', 'wpify_custom_fields', (value, props) => {
  return value || uuidv4();
});
