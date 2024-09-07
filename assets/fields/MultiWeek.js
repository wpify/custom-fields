import { MultiField } from '@/components/MultiField';
import { Week } from '@/fields/Week';

export function MultiWeek (props) {
  return <MultiField {...props} component={Week} />;
}
