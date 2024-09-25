import { MultiField } from '@/components/MultiField';
import { Datetime } from '@/fields/Datetime';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiDatetime = props => <MultiField {...props} component={Datetime} />;

MultiDatetime.checkValidity = checkValidityMultiFieldType;


addFilter('wpifycf_field_multi_datetime', 'wpify_custom_fields', () => MultiDatetime);
