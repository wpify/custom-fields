import { MultiField } from '@/components/MultiField';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiRichText = (props) => <MultiField {...props} type="richtext" />;

MultiRichText.checkValidity = checkValidityMultiFieldType('richtext');

export default MultiRichText;
