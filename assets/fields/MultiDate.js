import { MultiField } from '@/components/MultiField';
import { Date } from '@/fields/Date';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiDate = props => <MultiField {...props} component={Date} />;

MultiDate.checkValidity = checkValidityMultiFieldType;

addFilter('wpifycf_field_multi_date', 'wpify_custom_fields', () => MultiDate);
