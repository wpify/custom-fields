import { useConfig } from '@/helpers/hooks';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { applyFilters } from '@wordpress/hooks';
import { Text } from '@/fields/Text';

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
  if (Array.isArray(url)) {
    url.forEach(addStyleSheetItem);
  } else {
    addStyleSheetItem(url);
  }
}

function addStyleSheetItem (url) {
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
      url: addQueryArgs(config.api_path + '/url-title', { url }),
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

export function getFieldComponentByType (type) {
  return applyFilters('wpifycf_field_' + type, Text);
}

export function getValueByPath (obj = {}, path, currentPath = '') {
  let resolvedPath = path;
  const withoutHash = path.replace(/^#+/, '');
  const hashCount = path.length - withoutHash.length;
  const parts = currentPath.split('.');

  if (hashCount >= parts.length) {
    console.error(`Invalid path "${path}" in field "${currentPath}"`);
  } else if (hashCount > 0) {
    resolvedPath = parts.slice(0, parts.length - hashCount).join('.') + withoutHash;
  }

  return resolvedPath.split('.').reduce((acc, part) => {
    const match = part.match(/^([^\[]+)\[(\d+)]$/);

    if (match) {
      const key = match[1];
      const index = parseInt(match[2], 10);
      return acc && acc[key] ? acc[key][index] : undefined;
    }

    return acc ? acc[part] : undefined;
  }, obj);
}

// Function to evaluate individual conditions
function evaluateCondition(value, condition, expected) {
  switch (condition) {
    case '=':
      return value === expected;
    case '>':
      return value > expected;
    case '>=':
      return value >= expected;
    case '<':
      return value < expected;
    case '<=':
      return value < expected;
    case 'between':
      return value >= expected[0] && value <= expected[1];
    case 'contains':
      return value.includes(expected);
    default:
      return value === expected;
  }
}

// Function to evaluate the whole condition structure
export function evaluateConditions(data, conditions, currentPath) {
  if (!Array.isArray(conditions)) {
    throw new Error('Conditions must be an array');
  }

  let result = null;
  let operator = 'and'; // Default operator if none is specified

  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];

    if (typeof condition === 'string' && (condition === 'and' || condition === 'or')) {
      operator = condition;
    } else if (Array.isArray(condition)) {
      // Handle nested conditions
      const nestedResult = evaluateConditions(data, condition, currentPath);

      if (result === null) {
        result = nestedResult;
      } else {
        result = operator === 'and' ? result && nestedResult : result || nestedResult;
      }
    } else {
      // Evaluate individual condition
      const { field, condition: cond, value } = condition;
      const fieldValue = getValueByPath(data, field, currentPath);
      const evaluation = evaluateCondition(fieldValue, cond, value);

      if (result === null) {
        result = evaluation;
      } else {
        result = operator === 'and' ? result && evaluation : result || evaluation;
      }
    }
  }

  return result;
}
