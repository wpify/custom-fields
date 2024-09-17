import { MultiField } from '@/components/MultiField';
import { Number } from '@/fields/Number';
import { addFilter } from '@wordpress/hooks';

const MultiNumber = props => <MultiField {...props} component={Number} />;

addFilter('wpifycf_field_multi_number', 'wpify_custom_fields', () => MultiNumber);
