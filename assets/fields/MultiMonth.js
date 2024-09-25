import { MultiField } from '@/components/MultiField';
import { Month } from '@/fields/Month';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiMonth = props => <MultiField {...props} component={Month} />;

MultiMonth.checkValidity = checkValidityMultiFieldType;

addFilter('wpifycf_field_multi_month', 'wpify_custom_fields', () => MultiMonth);
