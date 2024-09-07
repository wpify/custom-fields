import { MultiField } from '@/components/MultiField';
import { Date } from '@/fields/Date';

export function MultiDate(props) {
  return <MultiField {...props} component={Date} />;
}
