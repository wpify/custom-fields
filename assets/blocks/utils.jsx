import React from 'react';
import { withSelect } from '@wordpress/data';

export const getImageSize = (image, size) => {
  const sizes = image?.media_details?.sizes;

  if (sizes && typeof sizes[size] !== 'undefined') {
    return sizes[size];
  }

  return null;
};

export const withImage = (prop, ownProp) => withSelect((select, ownProps) => {
  if (typeof ownProps[prop] === 'undefined' && typeof ownProps[ownProp] !== 'undefined') {
    return {
      ...ownProps,
      [prop]: select('core').getMedia(ownProps[ownProp]),
    };
  }

  return ownProps;
});

export const handleChange = (setAttributes, key) => (value) => {
  if (value === Object(value) && value.id) {
    setAttributes({ [key]: value.id });
  } else {
    setAttributes({ [key]: value });
  }
};

