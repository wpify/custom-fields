import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiDatetime = props => <MultiField {...props} type="datetime" />;

MultiDatetime.checkValidity = checkValidityMultiFieldType('datetime');


addFilter('wpifycf_field_multi_datetime', 'wpify_custom_fields', () => MultiDatetime);
