import {
  Icon,
  trash,
  chevronUpDown,
  edit,
  copy,
  bug,
  plus,
  formatBold,
  formatItalic,
  formatStrikethrough,
  code,
  headingLevel1,
  headingLevel2,
  headingLevel3,
  headingLevel4,
  headingLevel5,
  headingLevel6,
  formatListBullets,
  formatListNumbered,
  preformatted,
  quote,
  lineSolid,
  arrowLeft,
  arrowRight,
  paragraph,
  formatUnderline,
  link,
  linkOff,
} from '@wordpress/icons';
import clsx from 'clsx';

const icons = {
  trash,
  move: chevronUpDown,
  duplicate: copy,
  edit,
  plus,
  bold: formatBold,
  italic: formatItalic,
  strike: formatStrikethrough,
  code,
  h1: headingLevel1,
  h2: headingLevel2,
  h3: headingLevel3,
  h4: headingLevel4,
  h5: headingLevel5,
  h6: headingLevel6,
  bulletList: formatListBullets,
  numberList: formatListNumbered,
  preformatted,
  quote,
  line: lineSolid,
  arrowLeft,
  arrowRight,
  paragraph,
  underline: formatUnderline,
  link,
  linkOff,
};

export function IconButton ({ onClick, href, className, icon, style = 'light', size = 20 }) {
  const Tag = href ? 'a' : 'button';
  const props = {};

  if (href) {
    props.href = href;
    props.target = '_blank';
  } else {
    props.type = 'button';
  }

  const resolvedIcon = icons[icon] || bug;

  return (
    <Tag
      {...props}
      onClick={onClick}
      className={clsx('wpifycf-icon-button', `wpifycf-icon-button--${style}`, `wpifycf-icon-button--${icon}`, className)}
    >
      <Icon icon={resolvedIcon} size={size} />
    </Tag>
  );
}
