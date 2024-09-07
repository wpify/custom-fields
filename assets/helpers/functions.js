export function tryParseJson (value, defaultValue = null) {
  if (typeof value === 'string') {
    try {
      const parsedValue = JSON.parse(value);

      if (defaultValue !== null && typeof parsedValue !== typeof defaultValue) {
        return defaultValue;
      }

      return parsedValue;
    } catch (e) {
      return defaultValue;
    }
  }

  return value;
}

export function addStyleSheet (url) {
  if (document.querySelector(`link[href="${url}"]`)) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}
