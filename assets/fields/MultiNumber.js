import { MultiField } from '@/components/MultiField';
import { Number } from '@/fields/Number';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiNonZeroType } from '@/helpers/validators';

const MultiNumber = props => <MultiField {...props} component={Number} />;

MultiNumber.checkValidity = checkValidityMultiNonZeroType;

addFilter('wpifycf_field_multi_number', 'wpify_custom_fields', () => MultiNumber);
