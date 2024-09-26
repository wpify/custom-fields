import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiMonth = props => <MultiField {...props} type="month" />;

MultiMonth.checkValidity = checkValidityMultiFieldType('month');

addFilter('wpifycf_field_multi_month', 'wpify_custom_fields', () => MultiMonth);
