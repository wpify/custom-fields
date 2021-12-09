// noinspection JSCheckFunctionSignatures

import React, { Fragment, lazy, Suspense } from 'react';
import { addFilter } from '@wordpress/hooks';
import { v4 as uuidv4 } from 'uuid';

const TextField = lazy(() => import(/* webpackChunkName: "text-field" */ './TextField'));
const UrlField = lazy(() => import(/* webpackChunkName: "url-field" */ './UrlField'));
const EmailField = lazy(() => import(/* webpackChunkName: "email-field" */ './EmailField'));
const NumberField = lazy(() => import(/* webpackChunkName: "number-field" */ './NumberField'));
const TitleField = lazy(() => import(/* webpackChunkName: "title-field" */ './TitleField'));
const TelField = lazy(() => import(/* webpackChunkName: "tel-field" */ './TelField'));
const PasswordField = lazy(() => import(/* webpackChunkName: "password-field" */ './PasswordField'));
const ColorField = lazy(() => import(/* webpackChunkName: "color-field" */ './ColorField'));
const DatetimeField = lazy(() => import(/* webpackChunkName: "datetime-field" */ './DatetimeField'));
const MonthField = lazy(() => import(/* webpackChunkName: "month-field" */ './MonthField'));
const DateField = lazy(() => import(/* webpackChunkName: "date-field" */ './DateField'));
const TimeField = lazy(() => import(/* webpackChunkName: "time-field" */ './TimeField'));
const WeekField = lazy(() => import(/* webpackChunkName: "week-field" */ './WeekField'));
const TextareaField = lazy(() => import(/* webpackChunkName: "textarea-field" */ './TextareaField'));
const HtmlField = lazy(() => import(/* webpackChunkName: "html-field" */ './HtmlField'));
const HiddenField = lazy(() => import(/* webpackChunkName: "hidden-field" */ './HiddenField'));
const GroupField = lazy(() => import(/* webpackChunkName: "group-field" */ './GroupField'));
const MultiGroupField = lazy(() => import(/* webpackChunkName: "multi-group-field" */ './MultiGroupField'));
const CheckboxField = lazy(() => import(/* webpackChunkName: "checkbox-field" */ './CheckboxField'));
const ToggleField = lazy(() => import(/* webpackChunkName: "toggle-field" */ './ToggleField'));
const SelectField = lazy(() => import(/* webpackChunkName: "select-field" */ './SelectField'));
const MultiSelectField = lazy(() => import(/* webpackChunkName: "multi-select-field" */ './MultiSelectField'));
const CodeField = lazy(() => import(/* webpackChunkName: "code-field" */ './CodeField'));
const PostField = lazy(() => import(/* webpackChunkName: "post-field" */ './PostField'));
const MultiPostField = lazy(() => import(/* webpackChunkName: "multi-post-field" */ './MultiPostField'));
const AttachmentField = lazy(() => import(/* webpackChunkName: "attachment-field" */ './AttachmentField'));
const MultiAttachmentField = lazy(() => import(/* webpackChunkName: "multi-attachment-field" */ './MultiAttachmentField'));
const MultiToggleField = lazy(() => import(/* webpackChunkName: "multi-toggle-field" */ './MultiToggleField'));
const ButtonField = lazy(() => import(/* webpackChunkName: "button-field" */ './ButtonField'));
const ReactField = lazy(() => import(/* webpackChunkName: "react-field" */ './ReactField'));
const SeparatorField = lazy(() => import(/* webpackChunkName: "separator-field" */ './SeparatorField'));
const WysiwygField = lazy(() => import(/* webpackChunkName: "wysiwyg-field" */ './WysiwygField'));

addFilter(
	'wcf_field_without_wrapper',
	'wpify-custom-fields',
	(withoutWrapper, type, group_level = 0) => {
		if (type === 'group' && group_level === 0) {
			return true;
		}

		return withoutWrapper;
	}
);

addFilter(
	'wcf_field_without_label',
	'wpify-custom-fields',
	(withoutLabel, type) => {
		if (['html', 'title'].includes(type)) {
			return true;
		}

		return withoutLabel;
	}
);

addFilter(
	'wcf_field_without_section',
	'wpify-custom-fields',
	(withoutSection, type) => {
		if (['html', 'title'].includes(type)) {
			return true;
		}

		return withoutSection;
	}
);

addFilter(
	'wcf_generator_uuid',
	'wpify-custom-fields',
	(value) => value || uuidv4()
);


// eslint-disable-next-line react/display-name
const getComponent = Component => props => (
	<Suspense fallback={<Fragment/>}>
		<Component {...props} />
	</Suspense>
);

export const fields = {
	text: getComponent(TextField),
	url: getComponent(UrlField),
	email: getComponent(EmailField),
	number: getComponent(NumberField),
	title: getComponent(TitleField),
	tel: getComponent(TelField),
	password: getComponent(PasswordField),
	color: getComponent(ColorField),
	datetime: getComponent(DatetimeField),
	month: getComponent(MonthField),
	date: getComponent(DateField),
	time: getComponent(TimeField),
	week: getComponent(WeekField),
	textarea: getComponent(TextareaField),
	html: getComponent(HtmlField),
	hidden: getComponent(HiddenField),
	group: getComponent(GroupField),
	multi_group: getComponent(MultiGroupField),
	checkbox: getComponent(CheckboxField),
	toggle: getComponent(ToggleField),
	select: getComponent(SelectField),
	multi_select: getComponent(MultiSelectField),
	code: getComponent(CodeField),
	post: getComponent(PostField),
	multi_post: getComponent(MultiPostField),
	attachment: getComponent(AttachmentField),
	multi_attachment: getComponent(MultiAttachmentField),
	multi_toggle: getComponent(MultiToggleField),
	button: getComponent(ButtonField),
	react: getComponent(ReactField),
	separator: getComponent(SeparatorField),
	wysiwyg: getComponent(WysiwygField),
};
