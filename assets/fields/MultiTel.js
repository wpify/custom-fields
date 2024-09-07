import { MultiField } from '@/components/MultiField';
import { Tel } from '@/fields/Tel';

export function MultiTel(props) {
  return <MultiField {...props} component={Tel} />;
}
