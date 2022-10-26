import React, { useEffect, useState, useMemo, useRef } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import SelectControl from '../components/SelectControl';
import { useNormalizedValue, valueOrDefault } from '../helpers';

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
		post_type,
		post_type_name,
		query_args = {},
		appContext,
		options,
	} = props;

	const { value, currentValue, setCurrentValue } = useNormalizedValue(props);

	const div = useRef();

	const otherArgs = useMemo(() => {
		return {
			post_type,
			query_args,
			type: 'post',
		};
	}, [post_type, query_args]);

	const [selectedOptions, setSelectedOptions] = useState([]);
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
			if (event.key === 'Escape') {
				toggleOpen(false);
			}
		};

		if (isOpen) {
			//document.addEventListener('click', handleHide); // selects are at the end of the body, so it won't work
			document.addEventListener('keyup', handleHide);
		}

		return () => {
			//document.removeEventListener('click', handleHide); // selects are at the end of the body, so it won't work
			document.removeEventListener('keyup', handleHide);
		};
	}, [isOpen, toggleOpen]);

	useEffect(() => {
		if (selectedOptions?.length > 0) {
			const option = selectedOptions.find(Boolean);

			if (currentValue.url !== option?.permalink) {
				setCurrentValue({ ...currentValue, url: option?.permalink });
			}
		}
	}, [selectedOptions, currentValue, setCurrentValue]);

	const describedBy = description ? id + '-description' : null;

	const handleChange = (key) => (event) => {
		let newValue = { label: '', url: '', target: null, post: null };

		if (Object(currentValue) === currentValue) {
			newValue = { ...currentValue };
		}

		if (key === 'target') {
			newValue[key] = event.target.checked ? '_blank' : null;
		} else if (key === 'post') {
			newValue[key] = event;
			newValue['url'] = null;
		} else if (key === 'url') {
			newValue[key] = event.target.value;
			newValue['post'] = null;
		} else {
			newValue[key] = event.target.value;
		}

		setCurrentValue(newValue);
	};

	return (
		<div ref={ref}>
			<div className={classnames('wcf-link', className, { 'wcf-link--open': isOpen })} ref={div}>
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
						{post_type && (
							<label className="wcf-link__form-item">
								<span>{post_type_name}</span>
								<SelectControl
									id={id}
									onChange={handleChange('post')}
									required
									api={appContext.api}
									value={currentValue.post}
									otherArgs={otherArgs}
									defaultOptions={options}
									setOptions={setSelectedOptions}
								/>
							</label>
						)}
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
							<Icon icon={'external'}/>
						)}
						{(!Boolean(currentValue.label) && !Boolean(currentValue.url)) && (
							<Icon icon={'insert'}/>
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

LinkField.getHumanTitle = (item, innerValue) => {
	return innerValue?.label + ' (' + innerValue?.url + ')';
}

export default LinkField;
