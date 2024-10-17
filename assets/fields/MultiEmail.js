import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiEmail = props => <MultiField {...props} type="email" />;

MultiEmail.checkValidity = checkValidityMultiFieldType('email');

addFilter('wpifycf_field_multi_email', 'wpify_custom_fields', () => MultiEmail);
