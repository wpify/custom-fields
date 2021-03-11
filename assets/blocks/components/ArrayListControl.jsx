import React from 'react';
import {RichText} from "@wordpress/block-editor";

const ArrayListControl = ({value, onChange, className}) => {

  const content2array = v => v.split('</li>').map(item => item.replace('<li>', '')).filter(Boolean);
  const array2content = v => v?.map(i => `<li>${i}</li>`).join('');

  return (
    <RichText
      className={className}
      identifier="values"
      multiline="li"
      tagName="ul"
      onChange={(value) => {
        onChange(content2array(value))
      }}
      value={array2content(value)}
    />
  )
};

export default ArrayListControl;
