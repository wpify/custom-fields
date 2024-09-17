import { MultiField } from '@/components/MultiField';
import { Text } from '@/fields/Text';
import { addFilter } from '@wordpress/hooks';

const MultiText = props => <MultiField {...props} component={Text} />;

addFilter('wpifycf_field_multi_text', 'wpify_custom_fields', () => MultiText);
