/* eslint-disable react/prop-types */

import React from 'react';
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, PanelRow } from '@wordpress/components';
import { more } from '@wordpress/icons';
import classnames from 'classnames';
import './test-block-backend.scss';

const edit = (props) => {
  const {
    attributes,
    setAttributes,
    className,
  } = props;

  return (
    <>
      <div className={classnames('block-test-block', className)}>
        <RichText
          tagName="h2"
          onChange={title => setAttributes({ title })}
          value={attributes.title}
          keepPlaceholderOnFocus
          placeholder={__('Block heading', 'wpify-plugin')}
        />
        <RichText
          tagName="p"
          onChange={content => setAttributes({ content })}
          value={attributes.content}
          keepPlaceholderOnFocus
          placeholder={__('Some block content', 'wpify-plugin')}
        />
      </div>
      <InspectorControls>
        <PanelBody title={__('Test block settings', 'wpify-plugin')} icon={more} initialOpen={true}>
          <PanelRow>
            {__('Here is some block with inspector control', 'wpify-plugin')}
          </PanelRow>
        </PanelBody>
      </InspectorControls>
    </>
  );
};

const save = () => null;

const config = {
  title: __('Test block', 'wpify-plugin'),
  icon: 'universal-access-alt',
  category: 'wpify-plugin',
  example: {
    title: __('Test block heading', 'wpify-plugin'),
    content: __('This is a content of the block', 'wpify-plugin'),
  },
  edit,
  save,
};

registerBlockType('wpify-plugin/test-block', config);

export default config;
