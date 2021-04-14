import React from 'react';
import PT from 'prop-types';
import { doAction, applyFilters } from '@wordpress/hooks';
import Button from '../components/Button';
import classnames from 'classnames';

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
		description,
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
				<p dangerouslySetInnerHTML={{ __html: description }}/>
			)}
			{react_component && applyFilters(react_component, (<React.Fragment />))}
		</React.Fragment>
	);
};

ButtonField.propTypes = {
	className: PT.string,
	content: PT.oneOfType([PT.string, PT.element]),
	custom_attributes: PT.object,
};

export default ButtonField;
