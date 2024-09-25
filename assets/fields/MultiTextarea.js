import { MultiField } from '@/components/MultiField';
import { Textarea } from '@/fields/Textarea';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiTextarea = props => <MultiField {...props} component={Textarea} />;

MultiTextarea.checkValidity = checkValidityMultiFieldType;

addFilter('wpifycf_field_multi_textarea', 'wpify_custom_fields', () => MultiTextarea);
