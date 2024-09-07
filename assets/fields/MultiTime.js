import { MultiField } from '@/components/MultiField';
import { Time } from '@/fields/Time';

export function MultiTime(props) {
  return <MultiField {...props} component={Time} />;
}
