import { MultiField } from '@/components/MultiField';
import { Month } from '@/fields/Month';

export function MultiMonth(props) {
  return <MultiField {...props} component={Month} />;
}
