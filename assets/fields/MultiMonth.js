import { MultiField } from '@/components/MultiField';
import { Month } from '@/fields/Month';
import { addFilter } from '@wordpress/hooks';

const MultiMonth = props => <MultiField {...props} component={Month} />;

addFilter('wpifycf_field_multi_month', 'wpify_custom_fields', () => MultiMonth);
