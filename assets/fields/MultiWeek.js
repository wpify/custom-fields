import { MultiField } from '@/components/MultiField';
import { Month } from '@/fields/Month';
import { addFilter } from '@wordpress/hooks';

const MultiWeek = props => <MultiField {...props} component={Month} />;

addFilter('wpifycf_field_multi_week', 'wpify_custom_fields', () => MultiWeek);
