import { useCallback, useEffect, useState, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { AttachmentItem } from '@/fields/Attachment';
import { useSortableList, useMediaLibrary } from '@/helpers/hooks';
import { Button } from '@/components/Button';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityMultiFieldType, checkValidityMultiNonZeroType } from '@/helpers/validators';

function MultiAttachment ({
  id,
  value = [],
  attachment_type,
  onChange,
  className,
}) {
  if (!Array.isArray(value)) {
    value = [];
  }

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
  });

  useEffect(() => {
    value.length > 0 && Promise.all(
      value
        .map((id) => parseInt(id, 10))
        .filter(Boolean)
        .map((id) => wp.media.attachment(id).fetch()),
    )
      .then(setAttachments)
      .catch((error) =>
        console.error(__('Failed to fetch attachments', 'wpify-custom-fields'), error),
      );
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
    <span
      className={clsx('wpifycf-field-multi-attachment', `wpifycf-field-multi-attachment--${id}`, className)}
    >
      <Button className="wpifycf-button__add" onClick={openMediaLibrary}>
        {__('Add attachments', 'wpify-custom-fields')}
      </Button>
      <span className="wpifycf-field-multi-attachment__items" ref={containerRef}>
        {attachments.map((attachment) => (
          <AttachmentItem
            key={attachment.id}
            attachment={attachment}
            remove={remove(attachment.id)}
          />
        ))}
      </span>
    </span>
  );
}

MultiAttachment.checkValidity = checkValidityMultiNonZeroType;

addFilter('wpifycf_field_multi_attachment', 'wpify_custom_fields', () => MultiAttachment);
