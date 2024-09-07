import { MultiField } from '@/components/MultiField';
import { Text } from '@/fields/Text';

export function MultiText(props) {
  return <MultiField {...props} component={Text} />;
}
