import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { image as imageIcon } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useMediaLibrary } from '@/helpers/hooks';
import { INSERT_IMAGE_COMMAND } from '../nodes/WpImageNode';
import { pickBestSize } from '../imageSizes';

export function ImageButton({ disabled }) {
  const [editor] = useLexicalComposerContext();

  const openMediaLibrary = useMediaLibrary({
    multiple: false,
    type: 'image',
    title: __('Insert image', 'wpify-custom-fields'),
    button: __('Insert', 'wpify-custom-fields'),
    onSelect: (attachment) => {
      const size = pickBestSize(attachment);
      if (!size?.url) return;
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        src: size.url,
        alt: attachment.alt || '',
        width: size.width || null,
        height: size.height || null,
        attachmentId: attachment.id || null,
      });
    },
  });

  return (
    <Button
      className="wpifycf-field-richtext__button"
      icon={imageIcon}
      label={__('Insert image', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={openMediaLibrary}
    />
  );
}
