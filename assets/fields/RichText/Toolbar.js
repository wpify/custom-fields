import { applyFilters } from '@wordpress/hooks';
import { SEPARATOR, VIEW_CODE } from './config';
import useActiveFormat from './useActiveFormat';
import { UndoButton, RedoButton } from './buttons/History';
import { InlineFormatButton } from './buttons/InlineFormat';
import { ListButton } from './buttons/Lists';
import { AlignButton } from './buttons/Alignment';
import { IndentButton } from './buttons/Indent';
import { HorizontalRuleButton } from './buttons/HorizontalRule';
import { ImageButton } from './buttons/Image';
import { BlockFormatDropdown } from './buttons/BlockFormat';
import { LinkButton } from './buttons/Link';
import { PasteAsTextButton } from './buttons/PasteAsText';
import { ClearFormattingButton } from './buttons/ClearFormatting';
import { SpecialCharButton } from './buttons/SpecialChar';
import { TableButton } from './buttons/Table';
import { ViewToggleButton } from './buttons/ViewToggle';

export function Toolbar({
  toolbar,
  view,
  armedPasteAsText,
  onTogglePasteAsText,
  onToggleView,
  onOpenLink,
  disabled,
}) {
  const active = useActiveFormat();
  const inCode = view === VIEW_CODE;
  const blockIdsInConfig = toolbar.filter((id) => id.startsWith('block:'));
  const firstBlockIndex = toolbar.findIndex((id) => id.startsWith('block:'));
  const dropdownRendered = { value: false };

  const customButtons = applyFilters('wpifycf_richtext_buttons', {});

  return (
    <div className="wpifycf-field-richtext__toolbar" role="toolbar">
      {toolbar.map((id, idx) => {
        // Separator
        if (id === SEPARATOR) {
          return <span key={`sep-${idx}`} className="wpifycf-field-richtext__toolbar-separator" aria-hidden="true" />;
        }
        // Block dropdown — render once, at first block:* position
        if (id.startsWith('block:')) {
          if (dropdownRendered.value || idx !== firstBlockIndex) return null;
          dropdownRendered.value = true;
          return (
            <BlockFormatDropdown
              key="block-dropdown"
              enabledIds={blockIdsInConfig}
              blockType={active.blockType}
              disabled={disabled || inCode}
            />
          );
        }
        // All non-view-toggle buttons are disabled in code view
        const btnDisabled = disabled || (inCode && id !== 'view:toggle-code');

        switch (id) {
          case 'format:bold':
          case 'format:italic':
          case 'format:strikethrough':
            return (
              <InlineFormatButton
                key={id}
                kind={id.split(':')[1]}
                active={active[id.split(':')[1]]}
                disabled={btnDisabled}
              />
            );
          case 'list:ul':
          case 'list:ol': {
            const kind = id.split(':')[1];
            return (
              <ListButton key={id} kind={kind} active={active.listType === kind} disabled={btnDisabled} />
            );
          }
          case 'align:left':
          case 'align:center':
          case 'align:right':
          case 'align:justify': {
            const direction = id.split(':')[1];
            return (
              <AlignButton
                key={id}
                direction={direction}
                active={active.alignment === direction}
                disabled={btnDisabled}
              />
            );
          }
          case 'indent:increase':
          case 'indent:decrease':
            return <IndentButton key={id} direction={id.split(':')[1]} disabled={btnDisabled} />;
          case 'insert:link':
            return <LinkButton key={id} active={active.isLink} disabled={btnDisabled} onRequestOpen={onOpenLink} />;
          case 'insert:hr':
            return <HorizontalRuleButton key={id} disabled={btnDisabled} />;
          case 'insert:image':
            return <ImageButton key={id} disabled={btnDisabled} />;
          case 'insert:special-char':
            return <SpecialCharButton key={id} disabled={btnDisabled} />;
          case 'insert:table':
            return <TableButton key={id} disabled={btnDisabled} />;
          case 'action:paste-as-text':
            return (
              <PasteAsTextButton
                key={id}
                armed={armedPasteAsText}
                disabled={btnDisabled}
                onToggle={onTogglePasteAsText}
              />
            );
          case 'action:clear-formatting':
            return <ClearFormattingButton key={id} disabled={btnDisabled} />;
          case 'history:undo':
            return <UndoButton key={id} disabled={btnDisabled} canUndo={active.canUndo} />;
          case 'history:redo':
            return <RedoButton key={id} disabled={btnDisabled} canRedo={active.canRedo} />;
          case 'view:toggle-code':
            return <ViewToggleButton key={id} view={view} disabled={disabled} onToggle={onToggleView} />;
          default: {
            if (customButtons[id]) {
              const Btn = customButtons[id].render;
              if (Btn) return <Btn key={id} disabled={btnDisabled} />;
              // eslint-disable-next-line no-console
              if (process.env.NODE_ENV !== 'production') console.warn(`[richtext] custom button "${id}" has no render()`);
              return null;
            }
            // eslint-disable-next-line no-console
            if (process.env.NODE_ENV !== 'production') console.warn(`[richtext] unknown button id: ${id}`);
            return null;
          }
        }
      })}
    </div>
  );
}

export default Toolbar;
