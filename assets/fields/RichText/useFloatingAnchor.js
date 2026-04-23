import { useEffect, useRef, useState } from 'react';

// Positions a floating element below a rectangle returned by `getRect`.
// `getRect` is a new closure on every render, so we route it through a ref
// rather than listing it as a dependency — otherwise every render would tear
// down and rebuild the scroll/resize listeners, and the listed deps (`open`
// and `anchorKey`) are what actually change when the anchor moves.
export function useFloatingAnchor(getRect, deps) {
  const [pos, setPos] = useState(null);
  const getRectRef = useRef(getRect);
  useEffect(() => { getRectRef.current = getRect; }, [getRect]);

  useEffect(() => {
    if (!deps?.open) { setPos(null); return; }
    const update = () => {
      const rect = getRectRef.current?.();
      if (!rect) { setPos(null); return; }
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [deps?.open, deps?.anchorKey]);
  return pos;
}

export default useFloatingAnchor;
