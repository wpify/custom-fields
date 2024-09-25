import { MultiField } from '@/components/MultiField';
import { Mapycz } from '@/fields/Mapycz';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiMapycz = props => <MultiField {...props} component={Mapycz} />;

MultiMapycz.checkValidity = checkValidityMultiFieldType;

addFilter('wpifycf_field_multi_mapycz', 'wpify_custom_fields', () => MultiMapycz);
