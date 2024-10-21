import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiMapycz = props => <MultiField {...props} type="mapycz" />;

MultiMapycz.checkValidity = checkValidityMultiFieldType('mapycz');

addFilter('wpifycf_field_multi_mapycz', 'wpify_custom_fields', () => MultiMapycz);
