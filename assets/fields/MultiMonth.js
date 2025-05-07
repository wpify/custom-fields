import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiMonth = props => <MultiField {...props} type="month" />;

MultiMonth.checkValidity = checkValidityMultiFieldType('month');

export default MultiMonth;
