import { useConfig } from '@/helpers/hooks';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

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

export function isValidUrl (url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export async function getPageTitle (url) {
  try {
    const { config } = useConfig.getState();
    return await apiFetch({
      url: addQueryArgs(config.api_base + '/url-title', { url }),
    });
  } catch (error) {
    console.error('Error fetching the page:', error);
    return null;
  }
}

export function normalizeUrl (url) {
  url = url.trim();
  const disallowedSchemes = ['javascript:', 'data:'];

  for (const scheme of disallowedSchemes) {
    if (url.toLowerCase().startsWith(scheme)) {
      return '';
    }
  }

  if (url.startsWith('#') || url.startsWith('?')) {
    return url;
  }

  const schemesToClean = ['mailto:', 'tel:'];

  for (const scheme of schemesToClean) {
    if (url.toLowerCase().startsWith(scheme)) {
      return cleanSchemeUrl(url, scheme);
    }
  }

  if (url.startsWith('//')) {
    url = 'https:' + url;
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.href;
  } catch (e) {
    return '';
  }
}

function cleanSchemeUrl (url, scheme) {
  const content = url.slice(scheme.length);
  let cleanedContent;
  if (scheme === 'mailto:') {
    cleanedContent = cleanEmail(content);
  } else if (scheme === 'tel:') {
    cleanedContent = cleanTel(content);
  } else {
    cleanedContent = content;
  }
  return scheme + cleanedContent;
}

function cleanEmail (content) {
  content = decodeURIComponent(content);
  content = content.replace(/[^\w.!#$%&'*+/=?^`{|}~@-]/g, '');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(content) ? content : '';
}

function cleanTel (content) {
  content = decodeURIComponent(content);
  return content.replace(/[^\d+]/g, '');
}
