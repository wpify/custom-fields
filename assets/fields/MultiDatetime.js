import { MultiField } from '@/components/MultiField';
import { Datetime } from '@/fields/Datetime';

export function MultiDatetime(props) {
  return <MultiField {...props} component={Datetime} />;
}
