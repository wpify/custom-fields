import { MultiField } from '@/components/MultiField';
import { Mapycz } from '@/fields/Mapycz';
import { addFilter } from '@wordpress/hooks';

const MultiMapycz = props => <MultiField {...props} component={Mapycz} />;

addFilter('wpifycf_field_multi_mapycz', 'wpify_custom_fields', () => MultiMapycz);
