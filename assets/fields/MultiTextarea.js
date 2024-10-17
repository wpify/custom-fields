import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiTextarea = props => <MultiField {...props} type="textarea" />;

MultiTextarea.checkValidity = checkValidityMultiFieldType('textarea');

addFilter('wpifycf_field_multi_textarea', 'wpify_custom_fields', () => MultiTextarea);
