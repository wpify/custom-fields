import { MultiField } from '@/components/MultiField';
import { Tel } from '@/fields/Tel';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiTel = props => <MultiField {...props} component={Tel} />;

MultiTel.checkValidity = checkValidityMultiFieldType;

addFilter('wpifycf_field_multi_tel', 'wpify_custom_fields', () => MultiTel);
