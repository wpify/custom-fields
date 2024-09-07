import { MultiField } from '@/components/MultiField';
import { Color } from '@/fields/Color';

export function MultiColor(props) {
  return <MultiField {...props} component={Color} />;
}
