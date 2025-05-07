import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiWeek = props => <MultiField {...props} type="week" />;

MultiWeek.checkValidity = checkValidityMultiFieldType('week');

export default MultiWeek;
