import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiEmail = props => <MultiField {...props} type="email" />;

MultiEmail.checkValidity = checkValidityMultiFieldType('email');

export default MultiEmail;
