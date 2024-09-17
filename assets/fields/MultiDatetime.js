import { MultiField } from '@/components/MultiField';
import { Datetime } from '@/fields/Datetime';
import { addFilter } from '@wordpress/hooks';

const MultiDatetime = props => <MultiField {...props} component={Datetime} />;

addFilter('wpifycf_field_multi_datetime', 'wpify_custom_fields', () => MultiDatetime);
