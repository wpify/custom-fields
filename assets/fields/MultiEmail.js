import { MultiField } from '@/components/MultiField';
import { Email } from '@/fields/Email';
import { addFilter } from '@wordpress/hooks';

const MultiEmail = props => <MultiField {...props} component={Email} />;

addFilter('wpifycf_field_multi_email', 'wpify_custom_fields', () => MultiEmail);
