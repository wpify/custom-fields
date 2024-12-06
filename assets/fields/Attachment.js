import { useCallback, useEffect } from 'react';
import clsx from 'clsx';
import { IconButton } from '@/components/IconButton';
import { Button } from '@/components/Button';
import { __ } from '@wordpress/i18n';
import { useMediaLibrary, useAttachment } from '@/helpers/hooks';
import { addFilter } from '@wordpress/hooks';
import { checkValidityNonZeroIntegerType } from '@/helpers/validators';

function Attachment ({
  value = 0,
  id,
  onChange,
  attachment_type,
  attributes = {},
  className,
  disabled = false,
  setTitle,
}) {
  const { attachment, setAttachment } = useAttachment(value);

  useEffect(() => {
    if (attachment) {
      setTitle(attachment.filename);
    } else {
      setTitle('');
    }
  }, [attachment, setTitle]);

  const openMediaLibrary = useMediaLibrary({
    value,
    onChange,
    multiple: false,
    title: __('Select attachment', 'wpify-custom-fields'),
    button: __('Select attachment', 'wpify-custom-fields'),
    type: attachment_type,
  });

  const remove = useCallback(() => {
    setAttachment(null);
    onChange(0);
  }, [setAttachment, onChange]);

  return (
    <div
      className={clsx('wpifycf-field-attachment', `wpifycf-field-attachment--${id}`, attributes.class, className)}
    >
      {attachment && (
        <AttachmentItem attachment={attachment} remove={remove} disabled={disabled} />
      )}
      {!attachment && !disabled && (
        <Button onClick={openMediaLibrary} className="wpifycf-button__add">
          {__('Add attachment', 'wpify-custom-fields')}
        </Button>
      )}
    </div>
  );
}

export function AttachmentItem ({ attachment, remove, disabled }) {
  const thumbnail = attachment?.sizes?.medium?.url;
  const icon = attachment?.icon;

  return (
    <div
      className={clsx('wpifycf-attachment-item', {
        ['wpifycf-attachment-item--has-thumbnail']: !!thumbnail,
        ['wpifycf-attachment-item--has-icon']: !thumbnail,
      })}
    >
      {thumbnail ? (
        <div className="wpifycf-attachment-item__thumbnail">
          <img src={thumbnail} alt={attachment.filename} width={150} height={150} />
        </div>
      ) : (
        <div className="wpifycf-attachment-item__icon">
          <img src={icon} alt={attachment.filename} width={50} />
        </div>
      )}
      {!thumbnail && (
        <div className="wpifycf-attachment-item__info">
          {attachment.filename}
        </div>
      )}
      {!disabled && (
        <div className="wpifycf-attachment-item__actions">
          <IconButton href={attachment.editLink} icon="edit" style="dark"/>
          <IconButton onClick={remove} icon="trash" style="dark"/>
        </div>
      )}
    </div>
  );
}

Attachment.checkValidity = checkValidityNonZeroIntegerType;

addFilter('wpifycf_field_attachment', 'wpify_custom_fields', () => Attachment);
