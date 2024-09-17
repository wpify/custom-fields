import { MultiField } from '@/components/MultiField';
import { Link } from '@/fields/Link';
import { addFilter } from '@wordpress/hooks';

const MultiLink = props => <MultiField {...props} component={Link} />;

addFilter('wpifycf_field_multi_link', 'wpify_custom_fields', () => MultiLink);
