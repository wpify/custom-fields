import { MultiField } from '@/components/MultiField';
import { Date } from '@/fields/Date';
import { addFilter } from '@wordpress/hooks';

const MultiDate = props => <MultiField {...props} component={Date} />;

addFilter('wpifycf_field_multi_date', 'wpify_custom_fields', () => MultiDate);
