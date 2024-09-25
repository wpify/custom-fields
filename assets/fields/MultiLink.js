import { MultiField } from '@/components/MultiField';
import { Link } from '@/fields/Link';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiLink = props => <MultiField {...props} component={Link} />;

MultiLink.checkValidity = checkValidityMultiFieldType;

addFilter('wpifycf_field_multi_link', 'wpify_custom_fields', () => MultiLink);
