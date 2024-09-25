import { MultiField } from '@/components/MultiField';
import { Time } from '@/fields/Time';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiTime = props => <MultiField {...props} component={Time} />;

MultiTime.checkValidity = checkValidityMultiFieldType;

addFilter('wpifycf_field_multi_time', 'wpify_custom_fields', () => MultiTime);
