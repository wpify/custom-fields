import { useCallback, useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';

export function Attachment ({ htmlId, value, name, onChange }) {
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    if (value) {
      wp.media.attachment(value).fetch().then((data) => {
        setAttachment(data);
      });
    }
  }, [value]);

  const openMediaLibrary = () => {
    const file_frame = wp.media({
      multiple: false,
    });

    file_frame.on('select', () => {
      const attachment = file_frame.state().get('selection').first().toJSON();

      setAttachment(attachment);

      if (typeof onChange === 'function') {
        onChange(attachment.id);
      }
    });

    file_frame.open();
  };

  const remove = useCallback(function () {
    setAttachment(null);
    onChange(0);
  }, [setAttachment, onChange]);

  return (
    <div className="attachment-picker">
      <input type="hidden" id={htmlId} name={name} value={value} />
      <button type="button" onClick={openMediaLibrary} className="wpifycf-attachment-button">
        {attachment ? (
          attachment.sizes?.thumbnail.url ? (
            <img src={attachment.sizes.thumbnail.url} alt={attachment.filename} width={75} />
          ) : (
            <img src={attachment.icon} alt={attachment.filename} width={75} />
          )
        ) : (
          __('Select Attachment', 'wpify-custom-fields')
        )}
      </button>

      {attachment && (
        <div className="attachment-details">
          <p>{attachment.filename} [{attachment.filesizeHumanReadable}]</p>
          <p>
            {/* links to edit photo or remove photo */}
            <a href={attachment.editLink} target="_blank" rel="noopener noreferrer">{__('Edit', 'wpify-custom-fields')}</a>
            {' | '}
            <button type="button" onClick={remove}>{__('Remove', 'wpify-custom-fields')}</button>
          </p>
        </div>
      )}
    </div>
  );
}
