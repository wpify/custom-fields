import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiText = props => <MultiField {...props} type="text" />;

MultiText.checkValidity = checkValidityMultiFieldType('text');

addFilter('wpifycf_field_multi_text', 'wpify_custom_fields', () => MultiText);
