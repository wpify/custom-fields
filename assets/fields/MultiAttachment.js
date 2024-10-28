import { useCallback, useEffect, useState, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { AttachmentItem } from '@/fields/Attachment';
import { useSortableList, useMediaLibrary } from '@/helpers/hooks';
import { Button } from '@/components/Button';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiNonZeroType } from '@/helpers/validators';

function MultiAttachment ({
  id,
  value = [],
  attachment_type,
  onChange,
  className,
  disabled = false,
}) {
  useEffect(() => {
    if (!Array.isArray(value)) {
      onChange([]);
    }
  }, [value, onChange]);

  const [attachments, setAttachments] = useState([]);
  const containerRef = useRef(null);

  const onSortEnd = useCallback((next) => {
    setAttachments(next);
    onChange(next.map((attachment) => attachment.id));
  }, [onChange]);

  useSortableList({
    containerRef,
    items: attachments,
    setItems: onSortEnd,
    disabled,
  });

  useEffect(() => {
    if (value.length > 0) {
      Promise.allSettled(
        value.map(id => wp.media.attachment(String(id)).fetch()),
      ).then(
        results => setAttachments(
          results
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value),
        ),
      );
    }
  }, [value]);

  const openMediaLibrary = useMediaLibrary({
    value,
    onChange,
    multiple: true,
    title: __('Add attachments', 'wpify-custom-fields'),
    button: __('Add selected', 'wpify-custom-fields'),
    type: attachment_type,
  });

  const remove = useCallback(
    (removeId) => () => {
      const newValue = value.filter((id) => id !== removeId);
      onChange(newValue);
      setAttachments((attachments) => attachments.filter((attachment) => attachment.id !== removeId));
    },
    [onChange, value],
  );

  return (
    <div
      className={clsx('wpifycf-field-multi-attachment', `wpifycf-field-multi-attachment--${id}`, className)}
    >
      {!disabled && (
        <Button className="wpifycf-button__add" onClick={openMediaLibrary}>
          {__('Add attachments', 'wpify-custom-fields')}
        </Button>
      )}
      {attachments.length > 0 && (
        <div className="wpifycf-field-multi-attachment__items" ref={containerRef}>
          {attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              remove={remove(attachment.id)}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

MultiAttachment.checkValidity = checkValidityMultiNonZeroType;

addFilter('wpifycf_field_multi_attachment', 'wpify_custom_fields', () => MultiAttachment);
