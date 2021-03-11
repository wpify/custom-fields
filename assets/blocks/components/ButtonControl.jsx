import React, { useState } from 'react';
import { RichText, URLPopover, URLInput } from "@wordpress/block-editor";
import { Button } from '@wordpress/components';
import { keyboardReturn } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';

const ButtonControl = ({onChangeLabel, onChangeUrl, label, url, className}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hide = () => setIsFocused(false);
  const show = () => setIsFocused(true);

  return (
    <div
      className={classnames('button', className)}
      onClick={show}
    >
      <RichText
        placeholder='Text tlačítka'
        value={label}
        onChange={onChangeLabel}
      />
      {isFocused && (
        <URLPopover onClose={hide} focusOnMount={false}>
          <form onSubmit={hide} style={{ display: 'flex', marginBottom: '-8px' }}>
            <URLInput
              value={url}
              onChange={onChangeUrl}
              autoFocus={false}
            />
            <Button
              icon={keyboardReturn}
              label={__( 'Apply', 'wpify')}
              type="submit"
            />
          </form>
        </URLPopover>
      )}
    </div>
  )
};

export default ButtonControl;
