/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/components/App.js":
/*!**********************************!*\
  !*** ./assets/components/App.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   App: () => (/* binding */ App)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helpers_hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/helpers/hooks */ "./assets/helpers/hooks.js");
/* harmony import */ var _components_Field__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/components/Field */ "./assets/components/Field.js");




function App({
  integrationId,
  context
}) {
  const [fields, setFields] = (0,_helpers_hooks__WEBPACK_IMPORTED_MODULE_1__.useFields)(integrationId);
  const setContext = (0,_helpers_hooks__WEBPACK_IMPORTED_MODULE_1__.useCustomFieldsContext)(state => state.setContext);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => setContext(context), [context, setContext]);
  const getRenderOptions = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (context) {
    switch (context) {
      case 'options':
        return {
          noWrapper: true,
          noLabel: true
        };
      default:
        return {};
    }
  }, []);
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (id) {
    return function (value) {
      setFields(function (prev) {
        const nextFields = [...prev];
        const index = nextFields.findIndex(f => f.id === id);
        nextFields[index] = {
          ...nextFields[index],
          value
        };
        return nextFields;
      });
    };
  }, [setFields]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, fields.map((field, index) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_Field__WEBPACK_IMPORTED_MODULE_2__.Field, {
    key: field.id,
    ...field,
    name: field.id,
    htmlId: field.id,
    onChange: handleChange(field.id),
    renderOptions: getRenderOptions(context)
  })));
}

/***/ }),

/***/ "./assets/components/Field.js":
/*!************************************!*\
  !*** ./assets/components/Field.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Field: () => (/* binding */ Field)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_error_boundary__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-error-boundary */ "./node_modules/react-error-boundary/dist/react-error-boundary.development.esm.js");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _fields_Text_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/fields/Text.js */ "./assets/fields/Text.js");
/* harmony import */ var _components_FieldWrapper__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/components/FieldWrapper */ "./assets/components/FieldWrapper.js");
/* harmony import */ var _components_Label__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/components/Label */ "./assets/components/Label.js");








function Field({
  type,
  node,
  renderOptions,
  description,
  ...props
}) {
  const FieldComponent = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.applyFilters)('wpifycf_field_' + type, _fields_Text_js__WEBPACK_IMPORTED_MODULE_4__.Text, props);
  const fallback = (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wpifycf-error-boundary"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('An error occurred while rendering the field of type %s.', 'wpify-custom-fields'), type));
  const descriptionPosition = FieldComponent.descriptionPosition || 'after';
  const renderedDescription = description && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wpifycf-field-description"
  }, description);
  const field = (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_FieldWrapper__WEBPACK_IMPORTED_MODULE_5__.FieldWrapper, {
    renderOptions: renderOptions
  }, descriptionPosition === 'before' && renderedDescription, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_Label__WEBPACK_IMPORTED_MODULE_6__.Label, {
    type: type,
    renderOptions: renderOptions,
    ...props
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react_error_boundary__WEBPACK_IMPORTED_MODULE_7__.ErrorBoundary, {
    fallback: fallback
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(FieldComponent, {
    type: type,
    ...props
  })), descriptionPosition === 'after' && renderedDescription);
  if (node) {
    return (0,react_dom__WEBPACK_IMPORTED_MODULE_1__.createPortal)(field, node);
  }
  return field;
}

/***/ }),

/***/ "./assets/components/FieldWrapper.js":
/*!*******************************************!*\
  !*** ./assets/components/FieldWrapper.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FieldWrapper: () => (/* binding */ FieldWrapper)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function FieldWrapper({
  renderOptions = {},
  children
}) {
  if (renderOptions.noWrapper === true) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, children);
  }
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wpifycf-field-wrapper"
  }, children);
}

/***/ }),

/***/ "./assets/components/Label.js":
/*!************************************!*\
  !*** ./assets/components/Label.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Label: () => (/* binding */ Label)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

function Label({
  label,
  type,
  htmlId,
  renderOptions
}) {
  if (renderOptions?.noLabel === true) {
    return null;
  }
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    htmlFor: htmlId,
    className: `wpifycf-label wpifycf-label--${type}`
  }, label);
}

/***/ }),

/***/ "./assets/components/MultiField.js":
/*!*****************************************!*\
  !*** ./assets/components/MultiField.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiField: () => (/* binding */ MultiField)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function MultiField({
  component: Component,
  name,
  value = [],
  onChange,
  default: defaultValue,
  ...props
}) {
  const add = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function () {
    onChange([...value, defaultValue]);
  }, [value, defaultValue, onChange]);
  const remove = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (index) {
    return function () {
      const nextValues = [...value];
      nextValues.splice(index, 1);
      onChange(nextValues);
    };
  }, [value, onChange]);
  const moveUp = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (index) {
    return function () {
      if (index > 0) {
        const nextValues = [...value];
        const temp = nextValues[index];
        nextValues[index] = nextValues[index - 1];
        nextValues[index - 1] = temp;
        onChange(nextValues);
      }
    };
  }, [value, onChange]);
  const moveDown = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (index) {
    return function () {
      if (index < value.length - 1) {
        const nextValues = [...value];
        const temp = nextValues[index];
        nextValues[index] = nextValues[index + 1];
        nextValues[index + 1] = temp;
        onChange(nextValues);
      }
    };
  }, [value, onChange]);
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (index) {
    return function (fieldValue) {
      const nextValues = [...value];
      nextValues[index] = fieldValue;
      onChange(nextValues);
    };
  }, [value, onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("fieldset", {
    className: 'wpifycf-multi-field wpifycf-multi-field--' + props.type
  }, name && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "hidden",
    name: name,
    value: JSON.stringify(value)
  }), Array.isArray(value) && value.map((value, index) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wpifycf-multi-field-item"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wpifycf-multi-field-item-field"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Component, {
    key: index,
    value: value,
    default: defaultValue,
    onChange: handleChange(index),
    ...props,
    htmlId: props.id + '.' + index
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wpifycf-multi-field-item-actions"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    onClick: remove(index)
  }, "\u2796"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    onClick: moveUp(index)
  }, "\u2B06"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    onClick: moveDown(index)
  }, "\u2B07")))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wpifycf-multi-field-item-buttons-after"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    onClick: add
  }, "\u2795")));
}

/***/ }),

/***/ "./assets/fields/Attachment.js":
/*!*************************************!*\
  !*** ./assets/fields/Attachment.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Attachment: () => (/* binding */ Attachment)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);



function Attachment({
  htmlId,
  value,
  name,
  onChange
}) {
  const [attachment, setAttachment] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (value) {
      wp.media.attachment(value).fetch().then(data => {
        setAttachment(data);
      });
    }
  }, [value]);
  const openMediaLibrary = () => {
    const file_frame = wp.media({
      multiple: false
    });
    file_frame.on('select', () => {
      const attachment = file_frame.state().get('selection').first().toJSON();
      setAttachment(attachment);
      if (typeof onChange === 'function') {
        onChange(attachment.id);
      }
    });
    file_frame.open();
  };
  const remove = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function () {
    setAttachment(null);
    onChange(0);
  }, [setAttachment, onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "attachment-picker"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "hidden",
    id: htmlId,
    name: name,
    value: value
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    onClick: openMediaLibrary,
    className: "wpifycf-attachment-button"
  }, attachment ? attachment.sizes?.thumbnail.url ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("img", {
    src: attachment.sizes.thumbnail.url,
    alt: attachment.filename,
    width: 75
  }) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("img", {
    src: attachment.icon,
    alt: attachment.filename,
    width: 75
  }) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Select Attachment', 'wpify-custom-fields')), attachment && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "attachment-details"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, attachment.filename, " [", attachment.filesizeHumanReadable, "]"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: attachment.editLink,
    target: "_blank",
    rel: "noopener noreferrer"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Edit', 'wpify-custom-fields')), ' | ', (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    onClick: remove
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Remove', 'wpify-custom-fields')))));
}

/***/ }),

/***/ "./assets/fields/Button.js":
/*!*********************************!*\
  !*** ./assets/fields/Button.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Button: () => (/* binding */ Button)
/* harmony export */ });
function Button() {
  // TODO
  return 'Button';
}

/***/ }),

/***/ "./assets/fields/Checkbox.js":
/*!***********************************!*\
  !*** ./assets/fields/Checkbox.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Checkbox: () => (/* binding */ Checkbox)
/* harmony export */ });
function Checkbox() {
  // TODO
  return 'Checkbox';
}

/***/ }),

/***/ "./assets/fields/Code.js":
/*!*******************************!*\
  !*** ./assets/fields/Code.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Code: () => (/* binding */ Code)
/* harmony export */ });
function Code() {
  // TODO
  return 'Code';
}

/***/ }),

/***/ "./assets/fields/Color.js":
/*!********************************!*\
  !*** ./assets/fields/Color.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Color: () => (/* binding */ Color)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function Color({
  name,
  htmlId,
  onChange,
  value,
  attributes
}) {
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  }, [onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "color",
    name: name,
    id: htmlId,
    onChange: handleChange,
    value: value,
    className: "wpifycf-field-color",
    ...attributes
  });
}

/***/ }),

/***/ "./assets/fields/Date.js":
/*!*******************************!*\
  !*** ./assets/fields/Date.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Date: () => (/* binding */ Date)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function Date({
  name,
  htmlId,
  onChange,
  value,
  attributes
}) {
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  }, [onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "date",
    name: name,
    id: htmlId,
    onChange: handleChange,
    value: value,
    className: "wpifycf-field-date",
    ...attributes
  });
}

/***/ }),

/***/ "./assets/fields/Datetime.js":
/*!***********************************!*\
  !*** ./assets/fields/Datetime.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Datetime: () => (/* binding */ Datetime)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function Datetime({
  name,
  htmlId,
  onChange,
  value,
  attributes
}) {
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  }, [onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "date",
    name: name,
    id: htmlId,
    onChange: handleChange,
    value: value,
    className: "wpifycf-field-datetime",
    ...attributes
  });
}

/***/ }),

/***/ "./assets/fields/Email.js":
/*!********************************!*\
  !*** ./assets/fields/Email.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Email: () => (/* binding */ Email)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function Email({
  name,
  htmlId,
  onChange,
  value,
  attributes
}) {
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  }, [onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "email",
    name: name,
    id: htmlId,
    onChange: handleChange,
    value: value,
    className: "wpifycf-field-email",
    ...attributes
  });
}

/***/ }),

/***/ "./assets/fields/Group.js":
/*!********************************!*\
  !*** ./assets/fields/Group.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Group: () => (/* binding */ Group)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helpers_functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/helpers/functions */ "./assets/helpers/functions.js");
/* harmony import */ var _components_Field__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/components/Field */ "./assets/components/Field.js");




function Group({
  id,
  htmlId,
  name,
  value,
  onChange,
  items
}) {
  const [fields, setFields] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(items);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
    const nextValue = {
      ...value
    };
    const nextItems = items.map(function (item) {
      var _nextValue$item$id;
      return {
        ...item,
        htmlId: id + '.' + item.id,
        value: (_nextValue$item$id = nextValue[item.id]) !== null && _nextValue$item$id !== void 0 ? _nextValue$item$id : ''
      };
    });
    setFields(nextItems);
  }, [items, value]);
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (id) {
    return function (fieldValue) {
      const nextValue = {
        ...value
      };
      nextValue[id] = fieldValue;
      onChange(nextValue);
    };
  }, [value, onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("fieldset", {
    className: "wpifycf-group-field"
  }, name && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "hidden",
    id: htmlId,
    name: name,
    value: JSON.stringify(value)
  }), fields.map((field, index) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_Field__WEBPACK_IMPORTED_MODULE_2__.Field, {
    key: field.id,
    ...field,
    onChange: handleChange(field.id)
  })));
}
Group.descriptionPosition = 'before';


/***/ }),

/***/ "./assets/fields/Hidden.js":
/*!*********************************!*\
  !*** ./assets/fields/Hidden.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Hidden: () => (/* binding */ Hidden)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function Hidden({
  name,
  htmlId,
  onChange,
  value,
  attributes
}) {
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  }, [onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "hidden",
    name: name,
    id: htmlId,
    onChange: handleChange,
    value: value,
    className: "wpifycf-field-hidden",
    ...attributes
  });
}

/***/ }),

/***/ "./assets/fields/Html.js":
/*!*******************************!*\
  !*** ./assets/fields/Html.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Html: () => (/* binding */ Html)
/* harmony export */ });
function Html() {
  // TODO
  return 'Html';
}

/***/ }),

/***/ "./assets/fields/InnerBlock.js":
/*!*************************************!*\
  !*** ./assets/fields/InnerBlock.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InnerBlock: () => (/* binding */ InnerBlock)
/* harmony export */ });
function InnerBlock() {
  // TODO
  return 'InnerBlock';
}

/***/ }),

/***/ "./assets/fields/Link.js":
/*!*******************************!*\
  !*** ./assets/fields/Link.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Link: () => (/* binding */ Link)
/* harmony export */ });
function Link() {
  // TODO
  return 'Link';
}

/***/ }),

/***/ "./assets/fields/Mapycz.js":
/*!*********************************!*\
  !*** ./assets/fields/Mapycz.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Mapycz: () => (/* binding */ Mapycz)
/* harmony export */ });
function Mapycz() {
  // TODO
  return 'Mapycz';
}

/***/ }),

/***/ "./assets/fields/Month.js":
/*!********************************!*\
  !*** ./assets/fields/Month.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Month: () => (/* binding */ Month)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function Month({
  name,
  htmlId,
  onChange,
  value,
  attributes
}) {
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  }, [onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "month",
    name: name,
    id: htmlId,
    onChange: handleChange,
    value: value,
    className: "wpifycf-field-month",
    ...attributes
  });
}

/***/ }),

/***/ "./assets/fields/MultiAttachment.js":
/*!******************************************!*\
  !*** ./assets/fields/MultiAttachment.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiAttachment: () => (/* binding */ MultiAttachment)
/* harmony export */ });
function MultiAttachment() {
  // TODO
  return 'MultiAttachment';
}

/***/ }),

/***/ "./assets/fields/MultiButton.js":
/*!**************************************!*\
  !*** ./assets/fields/MultiButton.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiButton: () => (/* binding */ MultiButton)
/* harmony export */ });
function MultiButton() {
  // TODO
  return 'MultiButton';
}

/***/ }),

/***/ "./assets/fields/MultiCheckbox.js":
/*!****************************************!*\
  !*** ./assets/fields/MultiCheckbox.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiCheckbox: () => (/* binding */ MultiCheckbox)
/* harmony export */ });
function MultiCheckbox() {
  // TODO
  return 'MultiCheckbox';
}

/***/ }),

/***/ "./assets/fields/MultiCode.js":
/*!************************************!*\
  !*** ./assets/fields/MultiCode.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiCode: () => (/* binding */ MultiCode)
/* harmony export */ });
function MultiCode() {
  // TODO
  return 'MultiCode';
}

/***/ }),

/***/ "./assets/fields/MultiColor.js":
/*!*************************************!*\
  !*** ./assets/fields/MultiColor.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiColor: () => (/* binding */ MultiColor)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_MultiField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/MultiField */ "./assets/components/MultiField.js");
/* harmony import */ var _fields_Color__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/fields/Color */ "./assets/fields/Color.js");



function MultiColor(props) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_MultiField__WEBPACK_IMPORTED_MODULE_1__.MultiField, {
    ...props,
    component: _fields_Color__WEBPACK_IMPORTED_MODULE_2__.Color
  });
}

/***/ }),

/***/ "./assets/fields/MultiDate.js":
/*!************************************!*\
  !*** ./assets/fields/MultiDate.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiDate: () => (/* binding */ MultiDate)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_MultiField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/MultiField */ "./assets/components/MultiField.js");
/* harmony import */ var _fields_Date__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/fields/Date */ "./assets/fields/Date.js");



function MultiDate(props) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_MultiField__WEBPACK_IMPORTED_MODULE_1__.MultiField, {
    ...props,
    component: _fields_Date__WEBPACK_IMPORTED_MODULE_2__.Date
  });
}

/***/ }),

/***/ "./assets/fields/MultiDatetime.js":
/*!****************************************!*\
  !*** ./assets/fields/MultiDatetime.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiDatetime: () => (/* binding */ MultiDatetime)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_MultiField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/MultiField */ "./assets/components/MultiField.js");
/* harmony import */ var _fields_Datetime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/fields/Datetime */ "./assets/fields/Datetime.js");



function MultiDatetime(props) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_MultiField__WEBPACK_IMPORTED_MODULE_1__.MultiField, {
    ...props,
    component: _fields_Datetime__WEBPACK_IMPORTED_MODULE_2__.Datetime
  });
}

/***/ }),

/***/ "./assets/fields/MultiEmail.js":
/*!*************************************!*\
  !*** ./assets/fields/MultiEmail.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiEmail: () => (/* binding */ MultiEmail)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_MultiField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/MultiField */ "./assets/components/MultiField.js");
/* harmony import */ var _fields_Email__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/fields/Email */ "./assets/fields/Email.js");



function MultiEmail(props) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_MultiField__WEBPACK_IMPORTED_MODULE_1__.MultiField, {
    ...props,
    component: _fields_Email__WEBPACK_IMPORTED_MODULE_2__.Email
  });
}

/***/ }),

/***/ "./assets/fields/MultiGroup.js":
/*!*************************************!*\
  !*** ./assets/fields/MultiGroup.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiGroup: () => (/* binding */ MultiGroup)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_MultiField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/MultiField */ "./assets/components/MultiField.js");
/* harmony import */ var _fields_Group__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/fields/Group */ "./assets/fields/Group.js");



function MultiGroup(props) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_MultiField__WEBPACK_IMPORTED_MODULE_1__.MultiField, {
    ...props,
    component: _fields_Group__WEBPACK_IMPORTED_MODULE_2__.Group
  });
}

/***/ }),

/***/ "./assets/fields/MultiLink.js":
/*!************************************!*\
  !*** ./assets/fields/MultiLink.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiLink: () => (/* binding */ MultiLink)
/* harmony export */ });
function MultiLink() {
  // TODO
  return 'MultiLink';
}

/***/ }),

/***/ "./assets/fields/MultiMapycz.js":
/*!**************************************!*\
  !*** ./assets/fields/MultiMapycz.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiMapycz: () => (/* binding */ MultiMapycz)
/* harmony export */ });
function MultiMapycz() {
  // TODO
  return 'MultiMapycz';
}

/***/ }),

/***/ "./assets/fields/MultiMonth.js":
/*!*************************************!*\
  !*** ./assets/fields/MultiMonth.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiMonth: () => (/* binding */ MultiMonth)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_MultiField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/MultiField */ "./assets/components/MultiField.js");
/* harmony import */ var _fields_Month__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/fields/Month */ "./assets/fields/Month.js");



function MultiMonth(props) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_MultiField__WEBPACK_IMPORTED_MODULE_1__.MultiField, {
    ...props,
    component: _fields_Month__WEBPACK_IMPORTED_MODULE_2__.Month
  });
}

/***/ }),

/***/ "./assets/fields/MultiNumber.js":
/*!**************************************!*\
  !*** ./assets/fields/MultiNumber.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiNumber: () => (/* binding */ MultiNumber)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_MultiField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/MultiField */ "./assets/components/MultiField.js");
/* harmony import */ var _fields_Number__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/fields/Number */ "./assets/fields/Number.js");



function MultiNumber(props) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_MultiField__WEBPACK_IMPORTED_MODULE_1__.MultiField, {
    ...props,
    component: _fields_Number__WEBPACK_IMPORTED_MODULE_2__.Number
  });
}

/***/ }),

/***/ "./assets/fields/MultiPassword.js":
/*!****************************************!*\
  !*** ./assets/fields/MultiPassword.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiPassword: () => (/* binding */ MultiPassword)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_MultiField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/MultiField */ "./assets/components/MultiField.js");
/* harmony import */ var _fields_Password__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/fields/Password */ "./assets/fields/Password.js");



function MultiPassword(props) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_MultiField__WEBPACK_IMPORTED_MODULE_1__.MultiField, {
    ...props,
    component: _fields_Password__WEBPACK_IMPORTED_MODULE_2__.Password
  });
}

/***/ }),

/***/ "./assets/fields/MultiPost.js":
/*!************************************!*\
  !*** ./assets/fields/MultiPost.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiPost: () => (/* binding */ MultiPost)
/* harmony export */ });
function MultiPost() {
  // TODO
  return 'MultiPost';
}

/***/ }),

/***/ "./assets/fields/MultiSelect.js":
/*!**************************************!*\
  !*** ./assets/fields/MultiSelect.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiSelect: () => (/* binding */ MultiSelect)
/* harmony export */ });
function MultiSelect() {
  // TODO
  return 'MultiSelect';
}

/***/ }),

/***/ "./assets/fields/MultiTel.js":
/*!***********************************!*\
  !*** ./assets/fields/MultiTel.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiTel: () => (/* binding */ MultiTel)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_MultiField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/MultiField */ "./assets/components/MultiField.js");
/* harmony import */ var _fields_Tel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/fields/Tel */ "./assets/fields/Tel.js");



function MultiTel(props) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_MultiField__WEBPACK_IMPORTED_MODULE_1__.MultiField, {
    ...props,
    component: _fields_Tel__WEBPACK_IMPORTED_MODULE_2__.Tel
  });
}

/***/ }),

/***/ "./assets/fields/MultiTerm.js":
/*!************************************!*\
  !*** ./assets/fields/MultiTerm.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiTerm: () => (/* binding */ MultiTerm)
/* harmony export */ });
function MultiTerm() {
  // TODO
  return 'MultiTerm';
}

/***/ }),

/***/ "./assets/fields/MultiText.js":
/*!************************************!*\
  !*** ./assets/fields/MultiText.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiText: () => (/* binding */ MultiText)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_MultiField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/MultiField */ "./assets/components/MultiField.js");
/* harmony import */ var _fields_Text__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/fields/Text */ "./assets/fields/Text.js");



function MultiText(props) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_MultiField__WEBPACK_IMPORTED_MODULE_1__.MultiField, {
    ...props,
    component: _fields_Text__WEBPACK_IMPORTED_MODULE_2__.Text
  });
}

/***/ }),

/***/ "./assets/fields/MultiTextarea.js":
/*!****************************************!*\
  !*** ./assets/fields/MultiTextarea.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiTextarea: () => (/* binding */ MultiTextarea)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_MultiField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/MultiField */ "./assets/components/MultiField.js");
/* harmony import */ var _fields_Textarea__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/fields/Textarea */ "./assets/fields/Textarea.js");



function MultiTextarea(props) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_MultiField__WEBPACK_IMPORTED_MODULE_1__.MultiField, {
    ...props,
    component: _fields_Textarea__WEBPACK_IMPORTED_MODULE_2__.Textarea
  });
}

/***/ }),

/***/ "./assets/fields/MultiTime.js":
/*!************************************!*\
  !*** ./assets/fields/MultiTime.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiTime: () => (/* binding */ MultiTime)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_MultiField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/MultiField */ "./assets/components/MultiField.js");
/* harmony import */ var _fields_Time__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/fields/Time */ "./assets/fields/Time.js");



function MultiTime(props) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_MultiField__WEBPACK_IMPORTED_MODULE_1__.MultiField, {
    ...props,
    component: _fields_Time__WEBPACK_IMPORTED_MODULE_2__.Time
  });
}

/***/ }),

/***/ "./assets/fields/MultiToggle.js":
/*!**************************************!*\
  !*** ./assets/fields/MultiToggle.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiToggle: () => (/* binding */ MultiToggle)
/* harmony export */ });
function MultiToggle() {
  // TODO
  return 'MultiToggle';
}

/***/ }),

/***/ "./assets/fields/MultiUrl.js":
/*!***********************************!*\
  !*** ./assets/fields/MultiUrl.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiUrl: () => (/* binding */ MultiUrl)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_MultiField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/MultiField */ "./assets/components/MultiField.js");
/* harmony import */ var _fields_Url__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/fields/Url */ "./assets/fields/Url.js");



function MultiUrl(props) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_MultiField__WEBPACK_IMPORTED_MODULE_1__.MultiField, {
    ...props,
    component: _fields_Url__WEBPACK_IMPORTED_MODULE_2__.Url
  });
}

/***/ }),

/***/ "./assets/fields/MultiWeek.js":
/*!************************************!*\
  !*** ./assets/fields/MultiWeek.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiWeek: () => (/* binding */ MultiWeek)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_MultiField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/MultiField */ "./assets/components/MultiField.js");
/* harmony import */ var _fields_Week__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/fields/Week */ "./assets/fields/Week.js");



function MultiWeek(props) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_MultiField__WEBPACK_IMPORTED_MODULE_1__.MultiField, {
    ...props,
    component: _fields_Week__WEBPACK_IMPORTED_MODULE_2__.Week
  });
}

/***/ }),

/***/ "./assets/fields/MultiWysiwyg.js":
/*!***************************************!*\
  !*** ./assets/fields/MultiWysiwyg.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiWysiwyg: () => (/* binding */ MultiWysiwyg)
/* harmony export */ });
function MultiWysiwyg() {
  // TODO
  return 'MultiWysiwyg';
}

/***/ }),

/***/ "./assets/fields/Number.js":
/*!*********************************!*\
  !*** ./assets/fields/Number.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Number: () => (/* binding */ Number)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function Number({
  name,
  htmlId,
  onChange,
  value,
  attributes
}) {
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (event) {
    if (typeof onChange === 'function') {
      onChange(parseFloat(event.target.value));
    }
  }, [onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "number",
    name: name,
    id: htmlId,
    onChange: handleChange,
    value: value,
    className: "wpifycf-field-number",
    ...attributes
  });
}

/***/ }),

/***/ "./assets/fields/Password.js":
/*!***********************************!*\
  !*** ./assets/fields/Password.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Password: () => (/* binding */ Password)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function Password({
  name,
  htmlId,
  onChange,
  value,
  attributes
}) {
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (event) {
    if (typeof onChange === 'function') {
      onChange(parseFloat(event.target.value));
    }
  }, [onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "password",
    name: name,
    id: htmlId,
    onChange: handleChange,
    value: value,
    className: "wpifycf-field-password",
    ...attributes
  });
}

/***/ }),

/***/ "./assets/fields/Post.js":
/*!*******************************!*\
  !*** ./assets/fields/Post.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Post: () => (/* binding */ Post)
/* harmony export */ });
function Post() {
  // TODO
  return 'Post';
}

/***/ }),

/***/ "./assets/fields/Select.js":
/*!*********************************!*\
  !*** ./assets/fields/Select.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Select: () => (/* binding */ Select)
/* harmony export */ });
function Select() {
  // TODO
  return 'Select';
}

/***/ }),

/***/ "./assets/fields/Tel.js":
/*!******************************!*\
  !*** ./assets/fields/Tel.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Tel: () => (/* binding */ Tel)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function Tel({
  name,
  htmlId,
  onChange,
  value,
  attributes
}) {
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (event) {
    if (typeof onChange === 'function') {
      onChange(parseFloat(event.target.value));
    }
  }, [onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "tel",
    name: name,
    id: htmlId,
    onChange: handleChange,
    value: value,
    className: "wpifycf-field-tel",
    ...attributes
  });
}

/***/ }),

/***/ "./assets/fields/Term.js":
/*!*******************************!*\
  !*** ./assets/fields/Term.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Term: () => (/* binding */ Term)
/* harmony export */ });
function Term() {
  // TODO
  return 'Term';
}

/***/ }),

/***/ "./assets/fields/Text.js":
/*!*******************************!*\
  !*** ./assets/fields/Text.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Text: () => (/* binding */ Text)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function Text({
  name,
  htmlId,
  onChange,
  value,
  attributes
}) {
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  }, [onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "text",
    name: name,
    id: htmlId,
    onChange: handleChange,
    value: value,
    className: "wpifycf-field-text",
    ...attributes
  });
}

/***/ }),

/***/ "./assets/fields/Textarea.js":
/*!***********************************!*\
  !*** ./assets/fields/Textarea.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Textarea: () => (/* binding */ Textarea)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function Textarea({
  name,
  htmlId,
  onChange,
  value,
  attributes
}) {
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  }, [onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("textarea", {
    name: name,
    id: htmlId,
    onChange: handleChange,
    value: value,
    className: "wpifycf-field-textarea",
    ...attributes
  });
}

/***/ }),

/***/ "./assets/fields/Time.js":
/*!*******************************!*\
  !*** ./assets/fields/Time.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Time: () => (/* binding */ Time)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function Time({
  name,
  htmlId,
  onChange,
  value,
  attributes
}) {
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  }, [onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "time",
    name: name,
    id: htmlId,
    onChange: handleChange,
    value: value,
    className: "wpifycf-field-time",
    ...attributes
  });
}

/***/ }),

/***/ "./assets/fields/Title.js":
/*!********************************!*\
  !*** ./assets/fields/Title.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Title: () => (/* binding */ Title)
/* harmony export */ });
function Title() {
  // TODO
  return 'Title';
}

/***/ }),

/***/ "./assets/fields/Toggle.js":
/*!*********************************!*\
  !*** ./assets/fields/Toggle.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Toggle: () => (/* binding */ Toggle)
/* harmony export */ });
function Toggle() {
  // TODO
  return 'Toggle';
}

/***/ }),

/***/ "./assets/fields/Url.js":
/*!******************************!*\
  !*** ./assets/fields/Url.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Url: () => (/* binding */ Url)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function Url({
  name,
  htmlId,
  onChange,
  value,
  attributes
}) {
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  }, [onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "url",
    name: name,
    id: htmlId,
    onChange: handleChange,
    value: value,
    className: "wpifycf-field-url",
    ...attributes
  });
}

/***/ }),

/***/ "./assets/fields/Week.js":
/*!*******************************!*\
  !*** ./assets/fields/Week.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Week: () => (/* binding */ Week)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function Week({
  name,
  htmlId,
  onChange,
  value,
  attributes
}) {
  const handleChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (event) {
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  }, [onChange]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "week",
    name: name,
    id: htmlId,
    onChange: handleChange,
    value: value,
    className: "wpifycf-field-week",
    ...attributes
  });
}

/***/ }),

/***/ "./assets/fields/Wysiwyg.js":
/*!**********************************!*\
  !*** ./assets/fields/Wysiwyg.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Wysiwyg: () => (/* binding */ Wysiwyg)
/* harmony export */ });
function Wysiwyg() {
  // TODO
  return 'Wysiwyg';
}

/***/ }),

/***/ "./assets/helpers/field-types.js":
/*!***************************************!*\
  !*** ./assets/helpers/field-types.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   registerFieldTypes: () => (/* binding */ registerFieldTypes)
/* harmony export */ });
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _fields_Attachment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/fields/Attachment */ "./assets/fields/Attachment.js");
/* harmony import */ var _fields_Button__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/fields/Button */ "./assets/fields/Button.js");
/* harmony import */ var _fields_Checkbox__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/fields/Checkbox */ "./assets/fields/Checkbox.js");
/* harmony import */ var _fields_Code__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/fields/Code */ "./assets/fields/Code.js");
/* harmony import */ var _fields_Color__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/fields/Color */ "./assets/fields/Color.js");
/* harmony import */ var _fields_Date__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/fields/Date */ "./assets/fields/Date.js");
/* harmony import */ var _fields_Datetime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/fields/Datetime */ "./assets/fields/Datetime.js");
/* harmony import */ var _fields_Email__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @/fields/Email */ "./assets/fields/Email.js");
/* harmony import */ var _fields_Group__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @/fields/Group */ "./assets/fields/Group.js");
/* harmony import */ var _fields_Hidden__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @/fields/Hidden */ "./assets/fields/Hidden.js");
/* harmony import */ var _fields_Html__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @/fields/Html */ "./assets/fields/Html.js");
/* harmony import */ var _fields_InnerBlock__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @/fields/InnerBlock */ "./assets/fields/InnerBlock.js");
/* harmony import */ var _fields_Link__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @/fields/Link */ "./assets/fields/Link.js");
/* harmony import */ var _fields_Mapycz__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @/fields/Mapycz */ "./assets/fields/Mapycz.js");
/* harmony import */ var _fields_Month__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @/fields/Month */ "./assets/fields/Month.js");
/* harmony import */ var _fields_Number__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @/fields/Number */ "./assets/fields/Number.js");
/* harmony import */ var _fields_Password__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @/fields/Password */ "./assets/fields/Password.js");
/* harmony import */ var _fields_Post__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @/fields/Post */ "./assets/fields/Post.js");
/* harmony import */ var _fields_Select__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @/fields/Select */ "./assets/fields/Select.js");
/* harmony import */ var _fields_Tel__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @/fields/Tel */ "./assets/fields/Tel.js");
/* harmony import */ var _fields_Term__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @/fields/Term */ "./assets/fields/Term.js");
/* harmony import */ var _fields_Text__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @/fields/Text */ "./assets/fields/Text.js");
/* harmony import */ var _fields_Textarea__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @/fields/Textarea */ "./assets/fields/Textarea.js");
/* harmony import */ var _fields_Time__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @/fields/Time */ "./assets/fields/Time.js");
/* harmony import */ var _fields_Title__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! @/fields/Title */ "./assets/fields/Title.js");
/* harmony import */ var _fields_Toggle__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @/fields/Toggle */ "./assets/fields/Toggle.js");
/* harmony import */ var _fields_Url__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! @/fields/Url */ "./assets/fields/Url.js");
/* harmony import */ var _fields_Week__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! @/fields/Week */ "./assets/fields/Week.js");
/* harmony import */ var _fields_Wysiwyg__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! @/fields/Wysiwyg */ "./assets/fields/Wysiwyg.js");
/* harmony import */ var _fields_MultiAttachment__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! @/fields/MultiAttachment */ "./assets/fields/MultiAttachment.js");
/* harmony import */ var _fields_MultiButton__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! @/fields/MultiButton */ "./assets/fields/MultiButton.js");
/* harmony import */ var _fields_MultiCheckbox__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! @/fields/MultiCheckbox */ "./assets/fields/MultiCheckbox.js");
/* harmony import */ var _fields_MultiCode__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! @/fields/MultiCode */ "./assets/fields/MultiCode.js");
/* harmony import */ var _fields_MultiColor__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! @/fields/MultiColor */ "./assets/fields/MultiColor.js");
/* harmony import */ var _fields_MultiDate__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! @/fields/MultiDate */ "./assets/fields/MultiDate.js");
/* harmony import */ var _fields_MultiDatetime__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! @/fields/MultiDatetime */ "./assets/fields/MultiDatetime.js");
/* harmony import */ var _fields_MultiEmail__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! @/fields/MultiEmail */ "./assets/fields/MultiEmail.js");
/* harmony import */ var _fields_MultiGroup__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! @/fields/MultiGroup */ "./assets/fields/MultiGroup.js");
/* harmony import */ var _fields_MultiLink__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! @/fields/MultiLink */ "./assets/fields/MultiLink.js");
/* harmony import */ var _fields_MultiMapycz__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! @/fields/MultiMapycz */ "./assets/fields/MultiMapycz.js");
/* harmony import */ var _fields_MultiMonth__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! @/fields/MultiMonth */ "./assets/fields/MultiMonth.js");
/* harmony import */ var _fields_MultiNumber__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! @/fields/MultiNumber */ "./assets/fields/MultiNumber.js");
/* harmony import */ var _fields_MultiPassword__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! @/fields/MultiPassword */ "./assets/fields/MultiPassword.js");
/* harmony import */ var _fields_MultiPost__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! @/fields/MultiPost */ "./assets/fields/MultiPost.js");
/* harmony import */ var _fields_MultiSelect__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! @/fields/MultiSelect */ "./assets/fields/MultiSelect.js");
/* harmony import */ var _fields_MultiTel__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! @/fields/MultiTel */ "./assets/fields/MultiTel.js");
/* harmony import */ var _fields_MultiTerm__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! @/fields/MultiTerm */ "./assets/fields/MultiTerm.js");
/* harmony import */ var _fields_MultiText__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! @/fields/MultiText */ "./assets/fields/MultiText.js");
/* harmony import */ var _fields_MultiTextarea__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! @/fields/MultiTextarea */ "./assets/fields/MultiTextarea.js");
/* harmony import */ var _fields_MultiTime__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! @/fields/MultiTime */ "./assets/fields/MultiTime.js");
/* harmony import */ var _fields_MultiToggle__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! @/fields/MultiToggle */ "./assets/fields/MultiToggle.js");
/* harmony import */ var _fields_MultiUrl__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! @/fields/MultiUrl */ "./assets/fields/MultiUrl.js");
/* harmony import */ var _fields_MultiWeek__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(/*! @/fields/MultiWeek */ "./assets/fields/MultiWeek.js");
/* harmony import */ var _fields_MultiWysiwyg__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(/*! @/fields/MultiWysiwyg */ "./assets/fields/MultiWysiwyg.js");























































function registerFieldTypes() {
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_attachment', 'wpify_custom_fields', () => _fields_Attachment__WEBPACK_IMPORTED_MODULE_1__.Attachment);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_button', 'wpify_custom_fields', () => _fields_Button__WEBPACK_IMPORTED_MODULE_2__.Button);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_checkbox', 'wpify_custom_fields', () => _fields_Checkbox__WEBPACK_IMPORTED_MODULE_3__.Checkbox);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_code', 'wpify_custom_fields', () => _fields_Code__WEBPACK_IMPORTED_MODULE_4__.Code);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_color', 'wpify_custom_fields', () => _fields_Color__WEBPACK_IMPORTED_MODULE_5__.Color);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_date', 'wpify_custom_fields', () => _fields_Date__WEBPACK_IMPORTED_MODULE_6__.Date);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_datetime', 'wpify_custom_fields', () => _fields_Datetime__WEBPACK_IMPORTED_MODULE_7__.Datetime);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_email', 'wpify_custom_fields', () => _fields_Email__WEBPACK_IMPORTED_MODULE_8__.Email);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_group', 'wpify_custom_fields', () => _fields_Group__WEBPACK_IMPORTED_MODULE_9__.Group);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_hidden', 'wpify_custom_fields', () => _fields_Hidden__WEBPACK_IMPORTED_MODULE_10__.Hidden);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_html', 'wpify_custom_fields', () => _fields_Html__WEBPACK_IMPORTED_MODULE_11__.Html);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_inner_block', 'wpify_custom_fields', () => _fields_InnerBlock__WEBPACK_IMPORTED_MODULE_12__.InnerBlock);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_link', 'wpify_custom_fields', () => _fields_Link__WEBPACK_IMPORTED_MODULE_13__.Link);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_mapycz', 'wpify_custom_fields', () => _fields_Mapycz__WEBPACK_IMPORTED_MODULE_14__.Mapycz);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_month', 'wpify_custom_fields', () => _fields_Month__WEBPACK_IMPORTED_MODULE_15__.Month);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_number', 'wpify_custom_fields', () => _fields_Number__WEBPACK_IMPORTED_MODULE_16__.Number);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_password', 'wpify_custom_fields', () => _fields_Password__WEBPACK_IMPORTED_MODULE_17__.Password);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_post', 'wpify_custom_fields', () => _fields_Post__WEBPACK_IMPORTED_MODULE_18__.Post);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_select', 'wpify_custom_fields', () => _fields_Select__WEBPACK_IMPORTED_MODULE_19__.Select);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_tel', 'wpify_custom_fields', () => _fields_Tel__WEBPACK_IMPORTED_MODULE_20__.Tel);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_term', 'wpify_custom_fields', () => _fields_Term__WEBPACK_IMPORTED_MODULE_21__.Term);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_text', 'wpify_custom_fields', () => _fields_Text__WEBPACK_IMPORTED_MODULE_22__.Text);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_textarea', 'wpify_custom_fields', () => _fields_Textarea__WEBPACK_IMPORTED_MODULE_23__.Textarea);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_time', 'wpify_custom_fields', () => _fields_Time__WEBPACK_IMPORTED_MODULE_24__.Time);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_title', 'wpify_custom_fields', () => _fields_Title__WEBPACK_IMPORTED_MODULE_25__.Title);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_toggle', 'wpify_custom_fields', () => _fields_Toggle__WEBPACK_IMPORTED_MODULE_26__.Toggle);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_url', 'wpify_custom_fields', () => _fields_Url__WEBPACK_IMPORTED_MODULE_27__.Url);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_week', 'wpify_custom_fields', () => _fields_Week__WEBPACK_IMPORTED_MODULE_28__.Week);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_wysiwyg', 'wpify_custom_fields', () => _fields_Wysiwyg__WEBPACK_IMPORTED_MODULE_29__.Wysiwyg);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_attachment', 'wpify-custom-fields', () => _fields_MultiAttachment__WEBPACK_IMPORTED_MODULE_30__.MultiAttachment);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_button', 'wpify-custom-fields', () => _fields_MultiButton__WEBPACK_IMPORTED_MODULE_31__.MultiButton);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_checkbox', 'wpify-custom-fields', () => _fields_MultiCheckbox__WEBPACK_IMPORTED_MODULE_32__.MultiCheckbox);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_code', 'wpify-custom-fields', () => _fields_MultiCode__WEBPACK_IMPORTED_MODULE_33__.MultiCode);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_color', 'wpify-custom-fields', () => _fields_MultiColor__WEBPACK_IMPORTED_MODULE_34__.MultiColor);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_date', 'wpify-custom-fields', () => _fields_MultiDate__WEBPACK_IMPORTED_MODULE_35__.MultiDate);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_datetime', 'wpify-custom-fields', () => _fields_MultiDatetime__WEBPACK_IMPORTED_MODULE_36__.MultiDatetime);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_email', 'wpify-custom-fields', () => _fields_MultiEmail__WEBPACK_IMPORTED_MODULE_37__.MultiEmail);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_group', 'wpify-custom-fields', () => _fields_MultiGroup__WEBPACK_IMPORTED_MODULE_38__.MultiGroup);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_link', 'wpify-custom-fields', () => _fields_MultiLink__WEBPACK_IMPORTED_MODULE_39__.MultiLink);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_mapycz', 'wpify-custom-fields', () => _fields_MultiMapycz__WEBPACK_IMPORTED_MODULE_40__.MultiMapycz);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_month', 'wpify-custom-fields', () => _fields_MultiMonth__WEBPACK_IMPORTED_MODULE_41__.MultiMonth);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_number', 'wpify-custom-fields', () => _fields_MultiNumber__WEBPACK_IMPORTED_MODULE_42__.MultiNumber);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_password', 'wpify-custom-fields', () => _fields_MultiPassword__WEBPACK_IMPORTED_MODULE_43__.MultiPassword);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_post', 'wpify-custom-fields', () => _fields_MultiPost__WEBPACK_IMPORTED_MODULE_44__.MultiPost);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_select', 'wpify-custom-fields', () => _fields_MultiSelect__WEBPACK_IMPORTED_MODULE_45__.MultiSelect);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_tel', 'wpify-custom-fields', () => _fields_MultiTel__WEBPACK_IMPORTED_MODULE_46__.MultiTel);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_term', 'wpify-custom-fields', () => _fields_MultiTerm__WEBPACK_IMPORTED_MODULE_47__.MultiTerm);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_text', 'wpify-custom-fields', () => _fields_MultiText__WEBPACK_IMPORTED_MODULE_48__.MultiText);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_textarea', 'wpify-custom-fields', () => _fields_MultiTextarea__WEBPACK_IMPORTED_MODULE_49__.MultiTextarea);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_time', 'wpify-custom-fields', () => _fields_MultiTime__WEBPACK_IMPORTED_MODULE_50__.MultiTime);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_toggle', 'wpify-custom-fields', () => _fields_MultiToggle__WEBPACK_IMPORTED_MODULE_51__.MultiToggle);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_url', 'wpify-custom-fields', () => _fields_MultiUrl__WEBPACK_IMPORTED_MODULE_52__.MultiUrl);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_week', 'wpify-custom-fields', () => _fields_MultiWeek__WEBPACK_IMPORTED_MODULE_53__.MultiWeek);
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('wpifycf_field_multi_wysiwyg', 'wpify-custom-fields', () => _fields_MultiWysiwyg__WEBPACK_IMPORTED_MODULE_54__.MultiWysiwyg);
}

/***/ }),

/***/ "./assets/helpers/functions.js":
/*!*************************************!*\
  !*** ./assets/helpers/functions.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addStyleSheet: () => (/* binding */ addStyleSheet),
/* harmony export */   tryParseJson: () => (/* binding */ tryParseJson)
/* harmony export */ });
function tryParseJson(value, defaultValue = null) {
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
function addStyleSheet(url) {
  if (document.querySelector(`link[href="${url}"]`)) {
    return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

/***/ }),

/***/ "./assets/helpers/hooks.js":
/*!*********************************!*\
  !*** ./assets/helpers/hooks.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useCustomFieldsContext: () => (/* binding */ useCustomFieldsContext),
/* harmony export */   useFields: () => (/* binding */ useFields)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var zustand__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! zustand */ "./node_modules/zustand/esm/index.mjs");


function useFields(integrationId) {
  const initialFields = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(function () {
    const containers = document.querySelectorAll('.wpifycf-field[data-integration-id="' + integrationId + '"]');
    const fields = [];
    containers.forEach(function (container) {
      const props = JSON.parse(container.dataset.props);
      fields.push({
        ...props,
        node: container
      });
    });
    return fields;
  }, [integrationId]);
  const [fields, setFields] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(initialFields);
  return [fields, setFields];
}
const useCustomFieldsContext = (0,zustand__WEBPACK_IMPORTED_MODULE_1__.create)(set => ({
  context: 'default',
  setContext: context => set(state => ({
    context
  }))
}));

/***/ }),

/***/ "./assets/styles/custom-fields.scss":
/*!******************************************!*\
  !*** ./assets/styles/custom-fields.scss ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/react-error-boundary/dist/react-error-boundary.development.esm.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/react-error-boundary/dist/react-error-boundary.development.esm.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ErrorBoundary: () => (/* binding */ ErrorBoundary),
/* harmony export */   ErrorBoundaryContext: () => (/* binding */ ErrorBoundaryContext),
/* harmony export */   useErrorBoundary: () => (/* binding */ useErrorBoundary),
/* harmony export */   withErrorBoundary: () => (/* binding */ withErrorBoundary)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
'use client';


const ErrorBoundaryContext = (0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(null);

const initialState = {
  didCatch: false,
  error: null
};
class ErrorBoundary extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
  constructor(props) {
    super(props);
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
    this.state = initialState;
  }
  static getDerivedStateFromError(error) {
    return {
      didCatch: true,
      error
    };
  }
  resetErrorBoundary() {
    const {
      error
    } = this.state;
    if (error !== null) {
      var _this$props$onReset, _this$props;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      (_this$props$onReset = (_this$props = this.props).onReset) === null || _this$props$onReset === void 0 ? void 0 : _this$props$onReset.call(_this$props, {
        args,
        reason: "imperative-api"
      });
      this.setState(initialState);
    }
  }
  componentDidCatch(error, info) {
    var _this$props$onError, _this$props2;
    (_this$props$onError = (_this$props2 = this.props).onError) === null || _this$props$onError === void 0 ? void 0 : _this$props$onError.call(_this$props2, error, info);
  }
  componentDidUpdate(prevProps, prevState) {
    const {
      didCatch
    } = this.state;
    const {
      resetKeys
    } = this.props;

    // There's an edge case where if the thing that triggered the error happens to *also* be in the resetKeys array,
    // we'd end up resetting the error boundary immediately.
    // This would likely trigger a second error to be thrown.
    // So we make sure that we don't check the resetKeys on the first call of cDU after the error is set.

    if (didCatch && prevState.error !== null && hasArrayChanged(prevProps.resetKeys, resetKeys)) {
      var _this$props$onReset2, _this$props3;
      (_this$props$onReset2 = (_this$props3 = this.props).onReset) === null || _this$props$onReset2 === void 0 ? void 0 : _this$props$onReset2.call(_this$props3, {
        next: resetKeys,
        prev: prevProps.resetKeys,
        reason: "keys"
      });
      this.setState(initialState);
    }
  }
  render() {
    const {
      children,
      fallbackRender,
      FallbackComponent,
      fallback
    } = this.props;
    const {
      didCatch,
      error
    } = this.state;
    let childToRender = children;
    if (didCatch) {
      const props = {
        error,
        resetErrorBoundary: this.resetErrorBoundary
      };
      if (typeof fallbackRender === "function") {
        childToRender = fallbackRender(props);
      } else if (FallbackComponent) {
        childToRender = (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(FallbackComponent, props);
      } else if (fallback === null || (0,react__WEBPACK_IMPORTED_MODULE_0__.isValidElement)(fallback)) {
        childToRender = fallback;
      } else {
        {
          console.error("react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop");
        }
        throw error;
      }
    }
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(ErrorBoundaryContext.Provider, {
      value: {
        didCatch,
        error,
        resetErrorBoundary: this.resetErrorBoundary
      }
    }, childToRender);
  }
}
function hasArrayChanged() {
  let a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  let b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]));
}

function assertErrorBoundaryContext(value) {
  if (value == null || typeof value.didCatch !== "boolean" || typeof value.resetErrorBoundary !== "function") {
    throw new Error("ErrorBoundaryContext not found");
  }
}

function useErrorBoundary() {
  const context = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(ErrorBoundaryContext);
  assertErrorBoundaryContext(context);
  const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
    error: null,
    hasError: false
  });
  const memoized = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    resetBoundary: () => {
      context.resetErrorBoundary();
      setState({
        error: null,
        hasError: false
      });
    },
    showBoundary: error => setState({
      error,
      hasError: true
    })
  }), [context.resetErrorBoundary]);
  if (state.hasError) {
    throw state.error;
  }
  return memoized;
}

function withErrorBoundary(component, errorBoundaryProps) {
  const Wrapped = (0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(ErrorBoundary, errorBoundaryProps, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(component, {
    ...props,
    ref
  })));

  // Format for display in DevTools
  const name = component.displayName || component.name || "Unknown";
  Wrapped.displayName = "withErrorBoundary(".concat(name, ")");
  return Wrapped;
}




/***/ }),

/***/ "./node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js":
/*!**********************************************************************************************!*\
  !*** ./node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js ***!
  \**********************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * @license React
 * use-sync-external-store-shim.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



if (true) {
  (function() {

          'use strict';

/* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
if (
  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart ===
    'function'
) {
  __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
}
          var React = __webpack_require__(/*! react */ "react");

var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

function error(format) {
  {
    {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      printWarning('error', format, args);
    }
  }
}

function printWarning(level, format, args) {
  // When changing this logic, you might want to also
  // update consoleWithStackDev.www.js as well.
  {
    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
    var stack = ReactDebugCurrentFrame.getStackAddendum();

    if (stack !== '') {
      format += '%s';
      args = args.concat([stack]);
    } // eslint-disable-next-line react-internal/safe-string-coercion


    var argsWithFormat = args.map(function (item) {
      return String(item);
    }); // Careful: RN currently depends on this prefix

    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
    // breaks IE9: https://github.com/facebook/react/issues/13610
    // eslint-disable-next-line react-internal/no-production-logging

    Function.prototype.apply.call(console[level], console, argsWithFormat);
  }
}

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x, y) {
  return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y // eslint-disable-line no-self-compare
  ;
}

var objectIs = typeof Object.is === 'function' ? Object.is : is;

// dispatch for CommonJS interop named imports.

var useState = React.useState,
    useEffect = React.useEffect,
    useLayoutEffect = React.useLayoutEffect,
    useDebugValue = React.useDebugValue;
var didWarnOld18Alpha = false;
var didWarnUncachedGetSnapshot = false; // Disclaimer: This shim breaks many of the rules of React, and only works
// because of a very particular set of implementation details and assumptions
// -- change any one of them and it will break. The most important assumption
// is that updates are always synchronous, because concurrent rendering is
// only available in versions of React that also have a built-in
// useSyncExternalStore API. And we only use this shim when the built-in API
// does not exist.
//
// Do not assume that the clever hacks used by this hook also work in general.
// The point of this shim is to replace the need for hacks by other libraries.

function useSyncExternalStore(subscribe, getSnapshot, // Note: The shim does not use getServerSnapshot, because pre-18 versions of
// React do not expose a way to check if we're hydrating. So users of the shim
// will need to track that themselves and return the correct value
// from `getSnapshot`.
getServerSnapshot) {
  {
    if (!didWarnOld18Alpha) {
      if (React.startTransition !== undefined) {
        didWarnOld18Alpha = true;

        error('You are using an outdated, pre-release alpha of React 18 that ' + 'does not support useSyncExternalStore. The ' + 'use-sync-external-store shim will not work correctly. Upgrade ' + 'to a newer pre-release.');
      }
    }
  } // Read the current snapshot from the store on every render. Again, this
  // breaks the rules of React, and only works here because of specific
  // implementation details, most importantly that updates are
  // always synchronous.


  var value = getSnapshot();

  {
    if (!didWarnUncachedGetSnapshot) {
      var cachedValue = getSnapshot();

      if (!objectIs(value, cachedValue)) {
        error('The result of getSnapshot should be cached to avoid an infinite loop');

        didWarnUncachedGetSnapshot = true;
      }
    }
  } // Because updates are synchronous, we don't queue them. Instead we force a
  // re-render whenever the subscribed state changes by updating an some
  // arbitrary useState hook. Then, during render, we call getSnapshot to read
  // the current value.
  //
  // Because we don't actually use the state returned by the useState hook, we
  // can save a bit of memory by storing other stuff in that slot.
  //
  // To implement the early bailout, we need to track some things on a mutable
  // object. Usually, we would put that in a useRef hook, but we can stash it in
  // our useState hook instead.
  //
  // To force a re-render, we call forceUpdate({inst}). That works because the
  // new object always fails an equality check.


  var _useState = useState({
    inst: {
      value: value,
      getSnapshot: getSnapshot
    }
  }),
      inst = _useState[0].inst,
      forceUpdate = _useState[1]; // Track the latest getSnapshot function with a ref. This needs to be updated
  // in the layout phase so we can access it during the tearing check that
  // happens on subscribe.


  useLayoutEffect(function () {
    inst.value = value;
    inst.getSnapshot = getSnapshot; // Whenever getSnapshot or subscribe changes, we need to check in the
    // commit phase if there was an interleaved mutation. In concurrent mode
    // this can happen all the time, but even in synchronous mode, an earlier
    // effect may have mutated the store.

    if (checkIfSnapshotChanged(inst)) {
      // Force a re-render.
      forceUpdate({
        inst: inst
      });
    }
  }, [subscribe, value, getSnapshot]);
  useEffect(function () {
    // Check for changes right before subscribing. Subsequent changes will be
    // detected in the subscription handler.
    if (checkIfSnapshotChanged(inst)) {
      // Force a re-render.
      forceUpdate({
        inst: inst
      });
    }

    var handleStoreChange = function () {
      // TODO: Because there is no cross-renderer API for batching updates, it's
      // up to the consumer of this library to wrap their subscription event
      // with unstable_batchedUpdates. Should we try to detect when this isn't
      // the case and print a warning in development?
      // The store changed. Check if the snapshot changed since the last time we
      // read from the store.
      if (checkIfSnapshotChanged(inst)) {
        // Force a re-render.
        forceUpdate({
          inst: inst
        });
      }
    }; // Subscribe to the store and return a clean-up function.


    return subscribe(handleStoreChange);
  }, [subscribe]);
  useDebugValue(value);
  return value;
}

function checkIfSnapshotChanged(inst) {
  var latestGetSnapshot = inst.getSnapshot;
  var prevValue = inst.value;

  try {
    var nextValue = latestGetSnapshot();
    return !objectIs(prevValue, nextValue);
  } catch (error) {
    return true;
  }
}

function useSyncExternalStore$1(subscribe, getSnapshot, getServerSnapshot) {
  // Note: The shim does not use getServerSnapshot, because pre-18 versions of
  // React do not expose a way to check if we're hydrating. So users of the shim
  // will need to track that themselves and return the correct value
  // from `getSnapshot`.
  return getSnapshot();
}

var canUseDOM = !!(typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined');

var isServerEnvironment = !canUseDOM;

var shim = isServerEnvironment ? useSyncExternalStore$1 : useSyncExternalStore;
var useSyncExternalStore$2 = React.useSyncExternalStore !== undefined ? React.useSyncExternalStore : shim;

exports.useSyncExternalStore = useSyncExternalStore$2;
          /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
if (
  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop ===
    'function'
) {
  __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
}
        
  })();
}


/***/ }),

/***/ "./node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js":
/*!************************************************************************************************************!*\
  !*** ./node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js ***!
  \************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * @license React
 * use-sync-external-store-shim/with-selector.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



if (true) {
  (function() {

          'use strict';

/* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
if (
  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart ===
    'function'
) {
  __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
}
          var React = __webpack_require__(/*! react */ "react");
var shim = __webpack_require__(/*! use-sync-external-store/shim */ "./node_modules/use-sync-external-store/shim/index.js");

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x, y) {
  return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y // eslint-disable-line no-self-compare
  ;
}

var objectIs = typeof Object.is === 'function' ? Object.is : is;

var useSyncExternalStore = shim.useSyncExternalStore;

// for CommonJS interop.

var useRef = React.useRef,
    useEffect = React.useEffect,
    useMemo = React.useMemo,
    useDebugValue = React.useDebugValue; // Same as useSyncExternalStore, but supports selector and isEqual arguments.

function useSyncExternalStoreWithSelector(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
  // Use this to track the rendered snapshot.
  var instRef = useRef(null);
  var inst;

  if (instRef.current === null) {
    inst = {
      hasValue: false,
      value: null
    };
    instRef.current = inst;
  } else {
    inst = instRef.current;
  }

  var _useMemo = useMemo(function () {
    // Track the memoized state using closure variables that are local to this
    // memoized instance of a getSnapshot function. Intentionally not using a
    // useRef hook, because that state would be shared across all concurrent
    // copies of the hook/component.
    var hasMemo = false;
    var memoizedSnapshot;
    var memoizedSelection;

    var memoizedSelector = function (nextSnapshot) {
      if (!hasMemo) {
        // The first time the hook is called, there is no memoized result.
        hasMemo = true;
        memoizedSnapshot = nextSnapshot;

        var _nextSelection = selector(nextSnapshot);

        if (isEqual !== undefined) {
          // Even if the selector has changed, the currently rendered selection
          // may be equal to the new selection. We should attempt to reuse the
          // current value if possible, to preserve downstream memoizations.
          if (inst.hasValue) {
            var currentSelection = inst.value;

            if (isEqual(currentSelection, _nextSelection)) {
              memoizedSelection = currentSelection;
              return currentSelection;
            }
          }
        }

        memoizedSelection = _nextSelection;
        return _nextSelection;
      } // We may be able to reuse the previous invocation's result.


      // We may be able to reuse the previous invocation's result.
      var prevSnapshot = memoizedSnapshot;
      var prevSelection = memoizedSelection;

      if (objectIs(prevSnapshot, nextSnapshot)) {
        // The snapshot is the same as last time. Reuse the previous selection.
        return prevSelection;
      } // The snapshot has changed, so we need to compute a new selection.


      // The snapshot has changed, so we need to compute a new selection.
      var nextSelection = selector(nextSnapshot); // If a custom isEqual function is provided, use that to check if the data
      // has changed. If it hasn't, return the previous selection. That signals
      // to React that the selections are conceptually equal, and we can bail
      // out of rendering.

      // If a custom isEqual function is provided, use that to check if the data
      // has changed. If it hasn't, return the previous selection. That signals
      // to React that the selections are conceptually equal, and we can bail
      // out of rendering.
      if (isEqual !== undefined && isEqual(prevSelection, nextSelection)) {
        return prevSelection;
      }

      memoizedSnapshot = nextSnapshot;
      memoizedSelection = nextSelection;
      return nextSelection;
    }; // Assigning this to a constant so that Flow knows it can't change.


    // Assigning this to a constant so that Flow knows it can't change.
    var maybeGetServerSnapshot = getServerSnapshot === undefined ? null : getServerSnapshot;

    var getSnapshotWithSelector = function () {
      return memoizedSelector(getSnapshot());
    };

    var getServerSnapshotWithSelector = maybeGetServerSnapshot === null ? undefined : function () {
      return memoizedSelector(maybeGetServerSnapshot());
    };
    return [getSnapshotWithSelector, getServerSnapshotWithSelector];
  }, [getSnapshot, getServerSnapshot, selector, isEqual]),
      getSelection = _useMemo[0],
      getServerSelection = _useMemo[1];

  var value = useSyncExternalStore(subscribe, getSelection, getServerSelection);
  useEffect(function () {
    inst.hasValue = true;
    inst.value = value;
  }, [value]);
  useDebugValue(value);
  return value;
}

exports.useSyncExternalStoreWithSelector = useSyncExternalStoreWithSelector;
          /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
if (
  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop ===
    'function'
) {
  __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
}
        
  })();
}


/***/ }),

/***/ "./node_modules/use-sync-external-store/shim/index.js":
/*!************************************************************!*\
  !*** ./node_modules/use-sync-external-store/shim/index.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



if (false) {} else {
  module.exports = __webpack_require__(/*! ../cjs/use-sync-external-store-shim.development.js */ "./node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js");
}


/***/ }),

/***/ "./node_modules/use-sync-external-store/shim/with-selector.js":
/*!********************************************************************!*\
  !*** ./node_modules/use-sync-external-store/shim/with-selector.js ***!
  \********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



if (false) {} else {
  module.exports = __webpack_require__(/*! ../cjs/use-sync-external-store-shim/with-selector.development.js */ "./node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js");
}


/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = window["React"];

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/***/ ((module) => {

module.exports = window["ReactDOM"];

/***/ }),

/***/ "@wordpress/hooks":
/*!*******************************!*\
  !*** external ["wp","hooks"] ***!
  \*******************************/
/***/ ((module) => {

module.exports = window["wp"]["hooks"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "./node_modules/zustand/esm/index.mjs":
/*!********************************************!*\
  !*** ./node_modules/zustand/esm/index.mjs ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   create: () => (/* binding */ create),
/* harmony export */   createStore: () => (/* reexport safe */ zustand_vanilla__WEBPACK_IMPORTED_MODULE_0__.createStore),
/* harmony export */   "default": () => (/* binding */ react),
/* harmony export */   useStore: () => (/* binding */ useStore)
/* harmony export */ });
/* harmony import */ var zustand_vanilla__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! zustand/vanilla */ "./node_modules/zustand/esm/vanilla.mjs");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var use_sync_external_store_shim_with_selector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! use-sync-external-store/shim/with-selector.js */ "./node_modules/use-sync-external-store/shim/with-selector.js");





const { useDebugValue } = react__WEBPACK_IMPORTED_MODULE_1__;
const { useSyncExternalStoreWithSelector } = use_sync_external_store_shim_with_selector_js__WEBPACK_IMPORTED_MODULE_2__;
let didWarnAboutEqualityFn = false;
const identity = (arg) => arg;
function useStore(api, selector = identity, equalityFn) {
  if (( false ? 0 : void 0) !== "production" && equalityFn && !didWarnAboutEqualityFn) {
    console.warn(
      "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
    );
    didWarnAboutEqualityFn = true;
  }
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getInitialState,
    selector,
    equalityFn
  );
  useDebugValue(slice);
  return slice;
}
const createImpl = (createState) => {
  if (( false ? 0 : void 0) !== "production" && typeof createState !== "function") {
    console.warn(
      "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
    );
  }
  const api = typeof createState === "function" ? (0,zustand_vanilla__WEBPACK_IMPORTED_MODULE_0__.createStore)(createState) : createState;
  const useBoundStore = (selector, equalityFn) => useStore(api, selector, equalityFn);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
const create = (createState) => createState ? createImpl(createState) : createImpl;
var react = (createState) => {
  if (( false ? 0 : void 0) !== "production") {
    console.warn(
      "[DEPRECATED] Default export is deprecated. Instead use `import { create } from 'zustand'`."
    );
  }
  return create(createState);
};




/***/ }),

/***/ "./node_modules/zustand/esm/vanilla.mjs":
/*!**********************************************!*\
  !*** ./node_modules/zustand/esm/vanilla.mjs ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createStore: () => (/* binding */ createStore),
/* harmony export */   "default": () => (/* binding */ vanilla)
/* harmony export */ });
const createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const destroy = () => {
    if (( false ? 0 : void 0) !== "production") {
      console.warn(
        "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
      );
    }
    listeners.clear();
  };
  const api = { setState, getState, getInitialState, subscribe, destroy };
  const initialState = state = createState(setState, getState, api);
  return api;
};
const createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;
var vanilla = (createState) => {
  if (( false ? 0 : void 0) !== "production") {
    console.warn(
      "[DEPRECATED] Default export is deprecated. Instead use import { createStore } from 'zustand/vanilla'."
    );
  }
  return createStore(createState);
};




/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************************!*\
  !*** ./assets/custom-fields.js ***!
  \*********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_App__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/components/App */ "./assets/components/App.js");
/* harmony import */ var _helpers_field_types__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/helpers/field-types */ "./assets/helpers/field-types.js");
/* harmony import */ var _styles_custom_fields_scss__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/styles/custom-fields.scss */ "./assets/styles/custom-fields.scss");
/* harmony import */ var _helpers_functions__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/helpers/functions */ "./assets/helpers/functions.js");







function loadCustomFields(event) {
  document.querySelectorAll('.wpifycf-app[data-loaded=false]').forEach(function (container) {
    const form = container.closest('form');
    react_dom__WEBPACK_IMPORTED_MODULE_1___default().createRoot(container).render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.StrictMode, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_App__WEBPACK_IMPORTED_MODULE_2__.App, {
      integrationId: container.dataset.integrationId,
      form: form,
      context: container.dataset.context
    })));

    // TODO: Add a correct loading for product variations

    container.setAttribute('data-loaded', 'true');
  });
}
document.addEventListener('DOMContentLoaded', function () {
  (0,_helpers_field_types__WEBPACK_IMPORTED_MODULE_3__.registerFieldTypes)();
  loadCustomFields();
  (0,_helpers_functions__WEBPACK_IMPORTED_MODULE_5__.addStyleSheet)(window.wpifycf_custom_fields.stylesheet);
});
document.addEventListener('wpifycf_product_variation_loaded', loadCustomFields);
})();

/******/ })()
;
//# sourceMappingURL=wpify-custom-fields.js.map