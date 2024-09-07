import { MultiField } from '@/components/MultiField';
import { Url } from '@/fields/Url';

export function MultiUrl (props) {
  return <MultiField {...props} component={Url} />;
}
