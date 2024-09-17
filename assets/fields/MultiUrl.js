import { MultiField } from '@/components/MultiField';
import { Url } from '@/fields/Url';
import { addFilter } from '@wordpress/hooks';

const MultiUrl = props => <MultiField {...props} component={Url} />;

addFilter('wpifycf_field_multi_url', 'wpify_custom_fields', () => MultiUrl);
