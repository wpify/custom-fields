import { MultiField } from '@/components/MultiField';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiDateRange = props => <MultiField {...props} type="date_range" />;

MultiDateRange.checkValidity = checkValidityMultiFieldType('date_range');

export default MultiDateRange;
