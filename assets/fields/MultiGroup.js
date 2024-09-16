import { MultiField } from '@/components/MultiField';
import { Group } from '@/fields/Group';

export function MultiGroup (props) {
  return (
    <MultiField component={Group} {...props} />
  );
}
