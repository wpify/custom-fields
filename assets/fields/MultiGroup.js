import { MultiField } from '@/components/MultiField';
import { Group } from '@/fields/Group';
import { addFilter } from '@wordpress/hooks';

const MultiGroup = props => <MultiField {...props} component={Group} />;

addFilter('wpifycf_field_multi_group', 'wpify_custom_fields', () => MultiGroup);
