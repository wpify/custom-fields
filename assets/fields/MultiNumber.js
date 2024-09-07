import { MultiField } from '@/components/MultiField';
import { Number } from '@/fields/Number';

export function MultiNumber(props) {
  return <MultiField {...props} component={Number} />;
}
