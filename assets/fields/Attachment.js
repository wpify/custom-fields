import { useCallback, forwardRef } from 'react';
import clsx from 'clsx';
import { IconButton } from '@/components/IconButton';
import { Button } from '@/components/Button';
import { __ } from '@wordpress/i18n';
import { useMediaLibrary, useAttachment } from '@/helpers/hooks';
import { addFilter } from '@wordpress/hooks';

function Attachment ({
  htmlId,
  value,
  id,
  name,
  onChange,
  attachment_type,
  attributes = {},
}) {
  const { attachment, setAttachment } = useAttachment(value);

  const openMediaLibrary = useMediaLibrary({
    value,
    onChange,
    multiple: false,
    title: __('Select attachment', 'wpify-custom-fields'),
    button: __('Select attachment', 'wpify-custom-fields'),
    type: attachment_type,
  });

  const remove = useCallback(function () {
    setAttachment(null);
    onChange(0);
  }, [setAttachment, onChange]);

  return (
    <span
      className={clsx('wpifycf-field-attachment', `wpifycf-field-attachment--${id}`, attributes.class)}
    >
      {name && (
        <input type="hidden" id={htmlId} name={name} value={value} />
      )}
      {attachment && (
        <AttachmentItem attachment={attachment} remove={remove} />
      )}
      {!attachment && (
        <Button onClick={openMediaLibrary} className="wpifycf-button__add">
          {__('Add attachment', 'wpify-custom-fields')}
        </Button>
      )}
    </span>
  );
}

Attachment.Title = ({ field, value }) => {
  const { attachment } = useAttachment(value);

  if (attachment) {
    return attachment.filename;
  }

  return null;
};

export const AttachmentItem = forwardRef(function ({ attachment, remove }, ref) {
  const thumbnail = attachment?.sizes?.medium?.url;
  const icon = attachment?.icon;

  return (
    <span
      ref={ref}
      className={clsx('wpifycf-attachment-item', {
        ['wpifycf-attachment-item--has-thumbnail']: !!thumbnail,
        ['wpifycf-attachment-item--has-icon']: !thumbnail,
      })}
    >
      {thumbnail ? (
        <span className="wpifycf-attachment-item__thumbnail">
          <img src={thumbnail} alt={attachment.filename} width={150} height={150} />
        </span>
      ) : (
        <span className="wpifycf-attachment-item__icon">
          <img src={icon} alt={attachment.filename} width={50} />
        </span>
      )}
      {!thumbnail && (
        <span className="wpifycf-attachment-item__info">
          {attachment.filename}
        </span>
      )}
      <span className="wpifycf-attachment-item__actions">
        <IconButton href={attachment.editLink} icon="edit" style="dark" />
        <IconButton onClick={remove} icon="trash" style="dark" />
      </span>
    </span>
  );
});

addFilter('wpifycf_field_attachment', 'wpify_custom_fields', () => Attachment);
