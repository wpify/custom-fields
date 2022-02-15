import React, { useEffect, useState, useMemo, useRef } from 'react';
import PT from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';

// eslint-disable-next-line react/display-name
const LinkField = React.forwardRef((props, ref) => {
	const {
		id,
		htmlId = id => id,
		onChange,
		description,
		suffix,
		custom_attributes = {},
		group_level = 0,
		className,
	} = props;

	const defaultValue = { label: '', url: '', target: null };

	const value = useMemo(() => {
		if (props.generator) {
			return applyFilters('wcf_generator_' + props.generator, props.value, props);
		}

		if (Object(props.value) !== props.value) {
			return { ...defaultValue };
		}

		const val = { ...props.value };

		for (const valueKey in defaultValue.value) {
			if (!props[valueKey]) {
				val[valueKey] = defaultValue.value;
			}
		}

		return val;
	}, [props]);

	const [currentValue, setCurrentValue] = useState(value);

	const filled = Boolean(currentValue.url) || Boolean(currentValue.label) || Boolean(currentValue.target);

	const [isOpen, setIsOpen] = useState(false);

	const toggleOpen = (forceOpen) => {
		setIsOpen(isOpen => typeof forceOpen === 'boolean' ? forceOpen : !isOpen);
	};

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [onChange, value, currentValue]);

	useEffect(() => {
		const handleHide = (event) => {
			if (!event.path.includes(div.current) || event.key === 'Escape') {
				toggleOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('click', handleHide);
			document.addEventListener('keyup', handleHide);
		}

		return () => {
			document.removeEventListener('click', handleHide);
			document.removeEventListener('keyup', handleHide);
		}
	}, [isOpen, toggleOpen]);

	const div = useRef();

	const describedBy = description ? id + '-description' : null;

	const handleChange = (key) => (event) => {
		let newValue = { label: '', url: '', target: null };

		if (Object(currentValue) === currentValue) {
			newValue = { ...currentValue };
		}

		if (key === 'target') {
			newValue[key] = event.target.checked ? '_blank' : null;
		} else {
			newValue[key] = event.target.value;
		}

		setCurrentValue(newValue);
	};

	return (
		<div ref={ref}>
			<div className={classnames('wcf-link', { 'wcf-link--open': isOpen })} ref={div}>
				<input
					type="hidden"
					name={group_level === 0 ? id : null}
					value={JSON.stringify(currentValue)}
					ref={ref}
					{...custom_attributes}
				/>
				{isOpen ? (
					<div className="wcf-link__form">
						<label className="wcf-link__form-item">
							<span>{__('Label', 'wpify-custom-fields')}</span>
							<input
								type="text"
								value={currentValue.label}
								onChange={handleChange('label')}
								className={classnames('components-text-control__input')}
							/>
						</label>
						<label className="wcf-link__form-item">
							<span>{__('URL', 'wpify-custom-fields')}</span>
							<input
								type="url"
								value={currentValue.url}
								onChange={handleChange('url')}
								className={classnames('components-text-control__input')}
							/>
						</label>
						<label className="wcf-link__form-item">
							<input
								type="checkbox"
								value={currentValue.target}
								checked={currentValue.target === '_blank'}
								onChange={handleChange('target')}
								className={classnames('components-text-control__input')}
							/>
							<span>
								{__('Open in new window', 'wpify-custom-fields')}
							</span>
						</label>
					</div>
				) : (
					<div
						className={classnames('wcf-link__view', {
							'wcf-link__view--empty': !Boolean(currentValue.label) && !Boolean(currentValue.url)
						})}
						onClick={toggleOpen}
					>
						{currentValue.label && (
							<span className="wcf-link__label">{currentValue.label}</span>
						)}
						{currentValue.url && (
							(<span className="wcf-link__url">{currentValue.url}</span>)
						)}
						{currentValue.target === '_blank' && (
							<Icon icon={'external'} />
						)}
						{(!Boolean(currentValue.label) && !Boolean(currentValue.url)) && (
							<Icon icon={'insert'} />
						)}
					</div>
				)}
				<button type="button" id={htmlId(id)} className="wcf-link__toggle-button" onClick={toggleOpen}/>
			</div>
			{suffix && ' ' + suffix}
			{description && (
				<ErrorBoundary>
					<p className="description" id={describedBy} dangerouslySetInnerHTML={{ __html: description }}/>
				</ErrorBoundary>
			)}
		</div>
	);
});

LinkField.propTypes = {
	id: PT.string,
	htmlId: PT.func,
	value: PT.string,
	onChange: PT.func,
	description: PT.oneOfType([PT.string, PT.element]),
	suffix: PT.oneOfType([PT.string, PT.element]),
	custom_attributes: PT.oneOfType([PT.object, PT.array]),
	group_level: PT.number,
	className: PT.string,
	type: PT.oneOf(['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'tel', 'text', 'time', 'url', 'week', 'hidden']),
	generator: PT.string,
};

export default LinkField;
