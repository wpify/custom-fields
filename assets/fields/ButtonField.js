import React from 'react';
import PT from 'prop-types';
import { applyFilters, doAction } from '@wordpress/hooks';
import Button from '../components/Button';
import classnames from 'classnames';
import ErrorBoundary from '../components/ErrorBoundary';

const ButtonField = (props) => {
	const {
		className,
		title,
		desc,
		button = title,
		url,
		action,
		primary,
		react_component,
		description = desc,
		custom_attributes = {},
	} = props;

	const handleClick = () => {
		if (action) {
			doAction(action, props);
		}

		if (url) {
			location.href = url;
		}
	};

	return (
		<React.Fragment>
			<Button
				className={classnames(className, 'button', {
					'button-primary': primary,
				})}
				onClick={handleClick}
				{...custom_attributes}
			>
				{button}
			</Button>
			{description && (
				<ErrorBoundary>
					<p dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
			{react_component && (
				<ErrorBoundary>
					{applyFilters(react_component, (<React.Fragment/>))}
				</ErrorBoundary>
			)}
		</React.Fragment>
	);
};

ButtonField.propTypes = {
	className: PT.string,
	content: PT.oneOfType([PT.string, PT.element]),
	custom_attributes: PT.object,
	title: PT.string,
	desc: PT.string,
	button: PT.string,
	url: PT.string,
	action: PT.string,
	primary: PT.bool,
	react_component: PT.element,
	description: PT.string,
};

export default ButtonField;
