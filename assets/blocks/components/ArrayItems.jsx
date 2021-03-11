/* eslint-disable react/prop-types */
import React from 'react';
import { IconButton } from '@wordpress/components';
import styles from './ArrayItems.module.scss';
import classnames from 'classnames';

const ArrayItems = ({
  items = [],
  render = () => null,
  onChange = () => null,
  defaultItem = {},
  className,
}) => {
  const clone = val => JSON.parse(JSON.stringify(val));

  const handleAdd = () => {
    const newItems = clone(items);
    newItems.push(defaultItem);
    onChange(newItems);
  };

  const handleChange = (index) => (key) => (newValue) => {
    const newItems = clone(items);

    if (newValue === Object(newValue) && newValue.id) {
      newItems[index][key] = newValue.id;
    } else {
      newItems[index][key] = newValue;
    }

    onChange(newItems);
  };

  const handleDelete = (index) => () => {
    const newItems = clone(items);
    newItems.splice(index, 1);
    onChange(newItems);
  };

  return (
    <div className={classnames(styles.list, className)}>
      {items.map((item, index) => (
        <div key={index} className={styles.item}>
          <div className={styles.content}>
            {render(item, handleChange(index))}
          </div>
          <div className={styles.controls}>
            <IconButton icon="minus" onClick={handleDelete(index)} />
          </div>
        </div>
      ))}
      <div className={styles.listControls}>
        <IconButton icon="plus" onClick={handleAdd} />
      </div>
    </div>
  );
};

export default ArrayItems;
