import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiMapycz = props => <MultiField {...props} type="mapycz" />;

MultiMapycz.checkValidity = checkValidityMultiFieldType('mapycz');

export default MultiMapycz;
