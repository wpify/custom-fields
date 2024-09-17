import { MultiField } from '@/components/MultiField';
import { Textarea } from '@/fields/Textarea';
import { addFilter } from '@wordpress/hooks';

const MultiTextarea = props => <MultiField {...props} component={Textarea} />;

addFilter('wpifycf_field_multi_textarea', 'wpify_custom_fields', () => MultiTextarea);
