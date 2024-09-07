import { MultiField } from '@/components/MultiField';
import { Email } from '@/fields/Email';

export function MultiEmail(props) {
  return <MultiField {...props} component={Email} />;
}
