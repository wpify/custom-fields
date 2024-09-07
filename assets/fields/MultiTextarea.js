import { MultiField } from '@/components/MultiField';
import { Textarea } from '@/fields/Textarea';

export function MultiTextarea(props) {
  return <MultiField {...props} component={Textarea} />;
}
