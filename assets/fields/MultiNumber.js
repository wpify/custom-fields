import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiNumber = props => <MultiField {...props} type="number" />;

MultiNumber.checkValidity = checkValidityMultiFieldType('number');

addFilter('wpifycf_field_multi_number', 'wpify_custom_fields', () => MultiNumber);
