import { MultiField } from '@/components/MultiField';
import { Time } from '@/fields/Time';
import { addFilter } from '@wordpress/hooks';

const MultiTime = props => <MultiField {...props} component={Time} />;

addFilter('wpifycf_field_multi_time', 'wpify_custom_fields', () => MultiTime);
