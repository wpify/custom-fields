import React from 'react';
import { applyFilters, doAction } from '@wordpress/hooks';
import Button from '../components/Button';
import classnames from 'classnames';
import ErrorBoundary from '../components/ErrorBoundary';

const ButtonField = (rawProps) => {
	const props = applyFilters('wcf_field_props', rawProps);

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
					{applyFilters(react_component, (<div />))}
				</ErrorBoundary>
			)}
		</React.Fragment>
	);
};

export default ButtonField;
