import { MultiField } from '@/components/MultiField';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiLink = props => <MultiField {...props} type="link" />;

MultiLink.checkValidity = checkValidityMultiFieldType('link');

export default MultiLink;
