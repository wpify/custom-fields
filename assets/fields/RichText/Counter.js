import { useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';

export function Counter({ words, characters, charactersWithSpaces }) {
  const [withSpaces, setWithSpaces] = useState(false);
  const chars = withSpaces ? charactersWithSpaces : characters;
  const label = withSpaces
    ? __('Characters including whitespace — click to toggle', 'wpify-custom-fields')
    : __('Characters excluding whitespace — click to toggle', 'wpify-custom-fields');
  return (
    <button
      type="button"
      className="wpifycf-field-richtext__counter"
      title={label}
      onClick={() => setWithSpaces((v) => !v)}
    >
      {sprintf(
        /* translators: %1$d is the word count, %2$d is the character count. */
        __('%1$d words · %2$d characters', 'wpify-custom-fields'),
        words,
        chars,
      )}
    </button>
  );
}

export default Counter;
