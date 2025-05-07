import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiText = props => <MultiField {...props} type="text" />;

MultiText.checkValidity = checkValidityMultiFieldType('text');

export default MultiText;
