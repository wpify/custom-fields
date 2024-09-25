import { MultiField } from '@/components/MultiField';
import { Email } from '@/fields/Email';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiEmail = props => <MultiField {...props} component={Email} />;

MultiEmail.checkValidity = checkValidityMultiFieldType;

addFilter('wpifycf_field_multi_email', 'wpify_custom_fields', () => MultiEmail);
