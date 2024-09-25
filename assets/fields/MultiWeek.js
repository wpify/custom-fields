import { MultiField } from '@/components/MultiField';
import { Month } from '@/fields/Month';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiWeek = props => <MultiField {...props} component={Month} />;

MultiWeek.checkValidity = checkValidityMultiFieldType;

addFilter('wpifycf_field_multi_week', 'wpify_custom_fields', () => MultiWeek);
