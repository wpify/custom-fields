import { MultiField } from '@/components/MultiField';
import { Text } from '@/fields/Text';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiStringType } from '@/helpers/validators';

const MultiText = props => <MultiField {...props} component={Text} />;

MultiText.checkValidity = checkValidityMultiStringType;

addFilter('wpifycf_field_multi_text', 'wpify_custom_fields', () => MultiText);
