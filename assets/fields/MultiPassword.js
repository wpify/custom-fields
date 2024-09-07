import { MultiField } from '@/components/MultiField';
import { Password } from '@/fields/Password';

export function MultiPassword(props) {
  return <MultiField {...props} component={Password} />;
}
