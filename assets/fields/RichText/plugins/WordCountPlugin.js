import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';

export function countWords(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/u).filter(Boolean).length;
}

export function countCharacters(text, includeSpaces = false) {
  const source = text || '';
  if (includeSpaces) return [...source].length;
  return [...source.replace(/\s+/gu, '')].length;
}

export function WordCountPlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    let timeout = null;
    const emit = () => {
      editor.read(() => {
        const text = $getRoot().getTextContent();
        onChange?.({
          words: countWords(text),
          characters: countCharacters(text, false),
          charactersWithSpaces: countCharacters(text, true),
        });
      });
    };
    // Initial
    emit();
    const unregister = editor.registerUpdateListener(() => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(emit, 150);
    });
    return () => {
      if (timeout) clearTimeout(timeout);
      unregister();
    };
  }, [editor, onChange]);
  return null;
}

export default WordCountPlugin;
