import { useCallback, useEffect, useState, forwardRef } from 'react';
import clsx from 'clsx';
import { IconButton } from '@/components/IconButton';
import { Button } from '@/components/Button';
import { __ } from '@wordpress/i18n';
import { useMediaLibrary } from '@/helpers/hooks';

export function Attachment ({ htmlId, value, name, onChange }) {
  const [attachment, setAttachment] = useState(null);

  useEffect(function () {
    value && wp.media.attachment(value).fetch().then(setAttachment);
  }, [value]);

  const openMediaLibrary = useMediaLibrary({
    value,
    onChange,
    multiple: false,
    title: __('Select attachment', 'wpify-custom-fields'),
    button: {
      text: __('Select attachment', 'wpify-custom-fields'),
    },
  });

  const remove = useCallback(function () {
    setAttachment(null);
    onChange(0);
  }, [setAttachment, onChange]);

  return (
    <span className="wpifycf-field-attachment">
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
