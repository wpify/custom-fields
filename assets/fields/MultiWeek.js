import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiWeek = props => <MultiField {...props} type="week" />;

MultiWeek.checkValidity = checkValidityMultiFieldType('week');

addFilter('wpifycf_field_multi_week', 'wpify_custom_fields', () => MultiWeek);
