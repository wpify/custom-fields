import { addQueryArgs } from '@wordpress/url';
import apiFetch from '@wordpress/api-fetch';

export function get (path, data = {}) {
  if (path.match(/^https?:\/\//)) {
    return apiFetch({ url: addQueryArgs(path, data) });
  } else {
    return apiFetch({ path: addQueryArgs(path, data) });
  }
}

export function post (path, data = {}, args) {
  const options = { method: 'POST', data, ...args };

  if (path.match(/^https?:\/\//)) {
    return apiFetch({ url: path, ...options });
  } else {
    return apiFetch({ path, ...options });
  }
}

export function put (path, data = {}) {
  if (path.match(/^https?:\/\//)) {
    return apiFetch({ url: path, method: 'PUT', data });
  } else {
    return apiFetch({ path, method: 'PUT', data });
  }
}

export function del (path, data = {}) {
  if (path.match(/^https?:\/\//)) {
    return apiFetch({ url: addQueryArgs(path, data), method: 'DELETE' });
  } else {
    return apiFetch({ path: addQueryArgs(path, data), method: 'DELETE' });
  }
}

export function patch (path, data = {}) {
  if (path.match(/^https?:\/\//)) {
    return apiFetch({ url: path, method: 'PATCH', data });
  } else {
    return apiFetch({ path, method: 'PATCH', data });
  }
}
