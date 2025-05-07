import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiTel = props => <MultiField {...props} type="tel" />;

MultiTel.checkValidity = checkValidityMultiFieldType('tel');

export default MultiTel;
