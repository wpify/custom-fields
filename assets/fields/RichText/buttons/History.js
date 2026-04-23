import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { undo as undoIcon, redo as redoIcon } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { UNDO_COMMAND, REDO_COMMAND } from 'lexical';

export function UndoButton({ disabled, canUndo }) {
  const [editor] = useLexicalComposerContext();
  return (
    <Button
      className="wpifycf-field-richtext__button"
      icon={undoIcon}
      label={__('Undo', 'wpify-custom-fields')}
      disabled={disabled || !canUndo}
      onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
    />
  );
}

export function RedoButton({ disabled, canRedo }) {
  const [editor] = useLexicalComposerContext();
  return (
    <Button
      className="wpifycf-field-richtext__button"
      icon={redoIcon}
      label={__('Redo', 'wpify-custom-fields')}
      disabled={disabled || !canRedo}
      onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
    />
  );
}
