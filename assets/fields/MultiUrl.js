import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiUrl = props => <MultiField {...props} type="url" />;

MultiUrl.checkValidity = checkValidityMultiFieldType('url');

addFilter('wpifycf_field_multi_url', 'wpify_custom_fields', () => MultiUrl);
