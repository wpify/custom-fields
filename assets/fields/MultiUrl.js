import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiUrl = props => <MultiField {...props} type="url" />;

MultiUrl.checkValidity = checkValidityMultiFieldType('url');

export default MultiUrl;
