import { addQueryArgs } from '@wordpress/url';
import apiFetch from '@wordpress/api-fetch';

export function get (path, data = {}) {
  return apiFetch({ path: addQueryArgs(path, data) });
}

export function post (path, data = {}, args) {
  return apiFetch({
    path,
    method: 'POST',
    data,
    ...args,
  });
}

export function put (path, data = {}) {
  return apiFetch({
    path,
    method: 'PUT',
    data,
  });
}

export function del (path, data = {}) {
  return apiFetch({
    path: addQueryArgs(path, data),
    method: 'DELETE',
  });
}

export function patch (path, data = {}) {
  return apiFetch({
    path,
    method: 'PATCH',
    data,
  });
}
