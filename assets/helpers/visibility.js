import { createContext, useContext, useEffect, useRef, useState } from 'react';

// Distance around the viewport within which a field already counts as
// intersecting, so it starts loading shortly before it scrolls into view.
export const PRELOAD_MARGIN_PX = 200;

// How long an element must stay intersecting before it counts as visible,
// so fast scrolling doesn't activate every field passed along the way.
export const DWELL_MS = 200;

// Loadable state provided by Field. Defaults to true so the data hooks keep
// fetching eagerly when used outside a Field (e.g. third-party code).
export const LoadableContext = createContext(true);

export function useLoadable () {
  return useContext(LoadableContext);
}

let documentVisible = typeof document === 'undefined' || document.visibilityState !== 'hidden';

// element -> { onChange, intersecting, visible, timer }
const targets = new Map();

// One IntersectionObserver per document: the Gutenberg canvas (WP 6.3+) is a
// same-origin iframe, so observed elements can live in another document.
const observers = new Map();

function getObserver (doc) {
  if (!observers.has(doc)) {
    const ObserverClass = (doc.defaultView && doc.defaultView.IntersectionObserver) || IntersectionObserver;
    observers.set(doc, new ObserverClass(handleEntries, {
      rootMargin: `${PRELOAD_MARGIN_PX}px 0px ${PRELOAD_MARGIN_PX}px 0px`,
    }));
  }

  return observers.get(doc);
}

function handleEntries (entries) {
  entries.forEach(entry => {
    const state = targets.get(entry.target);

    if (!state) {
      return;
    }

    state.intersecting = entry.isIntersecting;
    updateTarget(state);
  });
}

function updateTarget (state) {
  if (state.intersecting && documentVisible) {
    if (!state.visible && !state.timer) {
      state.timer = setTimeout(() => {
        state.timer = null;
        if (state.intersecting && documentVisible && !state.visible) {
          state.visible = true;
          state.onChange(true);
        }
      }, DWELL_MS);
    }
  } else {
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }
    if (state.visible) {
      state.visible = false;
      state.onChange(false);
    }
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    documentVisible = document.visibilityState !== 'hidden';
    targets.forEach(state => updateTarget(state));
  });
}

/**
 * Watches an element and reports visibility: true after the element has been
 * intersecting the extended viewport for DWELL_MS while the document is
 * visible, false immediately when it stops intersecting or the document is
 * hidden. Returns a cleanup function.
 */
export function observeVisibility (element, onChange) {
  if (typeof IntersectionObserver === 'undefined') {
    onChange(true);
    return () => {};
  }

  const observer = getObserver(element.ownerDocument || document);
  const state = { onChange, intersecting: false, visible: false, timer: null };

  targets.set(element, state);
  observer.observe(element);

  return () => {
    if (state.timer) {
      clearTimeout(state.timer);
    }
    targets.delete(element);
    observer.unobserve(element);
  };
}

/**
 * Latch: flips to true the first time the sentinel becomes visible (or the
 * surrounding field receives focus) and stays true for the field's lifetime.
 * While `disabled` (e.g. the field is hidden and renders no sentinel), the
 * latch stays off instead of failing open.
 */
export function useLoadableLatch (disabled = false) {
  const sentinelRef = useRef(null);
  const [loadable, setLoadable] = useState(false);

  useEffect(() => {
    if (loadable || disabled) {
      return;
    }

    const element = sentinelRef.current;

    if (!element) {
      // Fail open: without a sentinel to observe, load eagerly.
      setLoadable(true);
      return;
    }

    const latch = () => setLoadable(true);
    const unobserve = observeVisibility(element, visible => visible && latch());
    // Focus bypass: an interacted field is by definition visible.
    const parent = element.parentElement;

    if (parent) {
      parent.addEventListener('focusin', latch);
    }

    return () => {
      unobserve();
      if (parent) {
        parent.removeEventListener('focusin', latch);
      }
    };
  }, [loadable, disabled]);

  return { sentinelRef, loadable };
}

/**
 * Continuous visibility of an element (used by the Gutenberg block preview,
 * which re-renders on attribute changes and is therefore not latched).
 */
export function useInViewport () {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      setVisible(true);
      return;
    }

    return observeVisibility(element, setVisible);
  }, []);

  return { ref, visible };
}
