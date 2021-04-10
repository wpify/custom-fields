import React, { useCallback, useEffect, useRef, useState } from 'react';
import { addFilter, applyFilters } from '@wordpress/hooks';
import TextField from './fields/TextField';
import UrlField from './fields/UrlField';
import EmailField from './fields/EmailField';
import NumberField from './fields/NumberField';
import TitleField from './fields/TitleField';
import TelField from './fields/TelField';
import PasswordField from './fields/PasswordField';
import ColorField from './fields/ColorField';
import DatetimeField from './fields/DatetimeField';
import MonthField from './fields/MonthField';
import DateField from './fields/DateField';
import TimeField from './fields/TimeField';
import WeekField from './fields/WeekField';
import TextareaField from './fields/TextareaField';
import HtmlField from './fields/HtmlField';
import GroupField from './fields/GroupField';
import MultiGroupField from './fields/MultiGroupField';
import CheckboxField from './fields/CheckboxField';
import ToggleField from './fields/ToggleField';
import SelectField from './fields/SelectField';
import MultiSelectField from './fields/MultiSelectField';
import CodeField from './fields/CodeField';
import PostField from './fields/PostField';
import MultiPostField from './fields/MultiPostField';
import AttachmentField from './fields/AttachmentField';
import MultiAttachmentField from './fields/MultiAttachmentField';

export const parseDataset = (dataset) => {
	const props = { ...dataset };

	Object.keys(props).forEach((key) => {
		try {
			props[key] = JSON.parse(props[key]);
		} catch (e) {
			if (!Number.isNaN(props[key]) && !Number.isNaN(parseFloat(props[key]))) {
				props[key] = parseFloat(props[key]);
			} else if (['true', 'false'].includes(props[key])) {
				props[key] = Boolean(props[key]);
			} else if (props[key] === 'null') {
				props[key] = null;
			}
		}
	});

	return props;
};

export const getItemComponent = (item) => {
	return applyFilters('wcf_field_' + item.type, React.Fragment, item);
};

export const registerFieldType = (type, Field) => {
	addFilter('wcf_field_' + type, 'wpify-custom-fields', Component => Field);
};

export const clone = value => JSON.parse(JSON.stringify(value));

export const useFetch = ({ defaultValue = null }) => {
	const controller = useRef(new AbortController());
	const [result, setResult] = useState(defaultValue);

	const fetch = useCallback(({ method, url, nonce, body }) => {
		controller.current.abort();
		controller.current = new AbortController();

		window.fetch(url, {
			method,
			signal: controller.current.signal,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-WP-Nonce': nonce
			},
			body: JSON.stringify(body),
		}).then(response => {
			if (response.ok) {
				return response.json();
			}
		}).then(setResult);
	}, []);

	return { fetch, result };
};

export const useDelay = (callback, deps, timeout = 500) => {
	const timer = useRef(0);

	useEffect(() => {
		window.clearTimeout(timer.current);

		timer.current = window.setTimeout(callback, timeout);

		return () => {
			window.clearTimeout(timer.current);
		};
	}, [...deps]);
};

export const useForceUpdate = () => {
	const [value, setValue] = useState(0);
	return () => setValue(value => value + 1);
};

export const registerFieldTypes = () => {
	registerFieldType('text', TextField);
	registerFieldType('url', UrlField);
	registerFieldType('email', EmailField);
	registerFieldType('number', NumberField);
	registerFieldType('title', TitleField);
	registerFieldType('tel', TelField);
	registerFieldType('password', PasswordField);
	registerFieldType('color', ColorField);
	registerFieldType('datetime', DatetimeField);
	registerFieldType('month', MonthField);
	registerFieldType('date', DateField);
	registerFieldType('time', TimeField);
	registerFieldType('week', WeekField);
	registerFieldType('textarea', TextareaField);
	registerFieldType('html', HtmlField);
	registerFieldType('group', GroupField);
	registerFieldType('multi_group', MultiGroupField);
	registerFieldType('checkbox', CheckboxField);
	registerFieldType('toggle', ToggleField);
	registerFieldType('select', SelectField);
	registerFieldType('multi_select', MultiSelectField);
	registerFieldType('code', CodeField);
	registerFieldType('post', PostField);
	registerFieldType('multi_post', MultiPostField);
	registerFieldType('attachment', AttachmentField);
	registerFieldType('multi_attachment', MultiAttachmentField);
}
