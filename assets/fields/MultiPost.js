import { MultiField } from '@/components/MultiField';
import { Post } from '@/fields/Post';
import { addFilter } from '@wordpress/hooks';

const MultiPost = props => <MultiField {...props} component={Post} />;

addFilter('wpifycf_field_multi_post', 'wpify_custom_fields', () => MultiPost);
