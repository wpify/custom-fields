import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiTextarea = props => <MultiField {...props} type="textarea" />;

MultiTextarea.checkValidity = checkValidityMultiFieldType('textarea');

export default MultiTextarea;
