/* eslint-disable react/prop-types */

import React from 'react';
import {MediaUpload, MediaUploadCheck} from "@wordpress/block-editor";
import {Button, Spinner} from "@wordpress/components";
import {getImageSize, withImage} from "../utils";
import { __ } from '@wordpress/i18n';

const ImageControl = ({
  value,
  image = null,
  title = __('Select an image', 'mojamiska'),
  size = 'full',
  onChange = () => null,
  allowedTypes = ['image'],
  className,
}) => {
  const imageSize = getImageSize(image, size);

  return (
    <div className={className}>
      <MediaUploadCheck>
        <MediaUpload
          onSelect={onChange}
          allowedTypes={allowedTypes}
          value={value}
          title={title}
          render={({ open }) => {
            if (value && !image) {
              return <Spinner />;
            }

            if (imageSize) {
              return (
                <img
                  src={imageSize.source_url}
                  width={imageSize.width}
                  height={imageSize.height}
                  onClick={open}
                />
              );
            }

            return (
              <Button onClick={open}>
                {title}
              </Button>
            )
          }}
        />
      </MediaUploadCheck>
    </div>
  );
};

export default withImage('image', 'value')(ImageControl);
