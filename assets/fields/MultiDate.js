import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiDate = props => <MultiField {...props} type="date" />;

MultiDate.checkValidity = checkValidityMultiFieldType('date');

addFilter('wpifycf_field_multi_date', 'wpify_custom_fields', () => MultiDate);
