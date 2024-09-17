import { MultiField } from '@/components/MultiField';
import { Select } from '@/fields/Select';
import { addFilter } from '@wordpress/hooks';

const MultiSelect = props => <MultiField {...props} component={Select} />;

addFilter('wpifycf_field_multi_select', 'wpify_custom_fields', () => MultiSelect);
