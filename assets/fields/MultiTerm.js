import { MultiField } from '@/components/MultiField';
import { Term } from '@/fields/Term';
import { addFilter } from '@wordpress/hooks';

const MultiTerm = props => <MultiField {...props} component={Term} />;

addFilter('wpifycf_field_multi_term', 'wpify_custom_fields', () => MultiTerm);
