import { MultiField } from '@/components/MultiField';
import { Url } from '@/fields/Url';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiUrl = props => <MultiField {...props} component={Url} />;

MultiUrl.checkValidity = checkValidityMultiFieldType;

addFilter('wpifycf_field_multi_url', 'wpify_custom_fields', () => MultiUrl);
