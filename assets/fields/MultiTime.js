import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiTime = props => <MultiField {...props} type="time" />;

MultiTime.checkValidity = checkValidityMultiFieldType('time');

addFilter('wpifycf_field_multi_time', 'wpify_custom_fields', () => MultiTime);
