import { MultiField } from '../components/MultiField';
import { checkValidityMultiFieldType } from '../helpers/validators';

const MultiDirectFile = props => <MultiField {...props} type="direct_file" />;

MultiDirectFile.checkValidity = checkValidityMultiFieldType('direct_file');

export default MultiDirectFile;
