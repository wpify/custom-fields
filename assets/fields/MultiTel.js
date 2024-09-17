import { MultiField } from '@/components/MultiField';
import { Tel } from '@/fields/Tel';
import { addFilter } from '@wordpress/hooks';

const MultiTel = props => <MultiField {...props} component={Tel} />;

addFilter('wpifycf_field_multi_tel', 'wpify_custom_fields', () => MultiTel);
