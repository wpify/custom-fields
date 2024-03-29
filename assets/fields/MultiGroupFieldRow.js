import React, { useCallback } from 'react';
import classnames from 'classnames';
import { getItemComponent, htmlDecode } from '../helpers';
import CloseButton from '../components/CloseButton';
import ErrorBoundary from '../components/ErrorBoundary';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import CloneButton from '../components/CloneButton';

const MultiGroupFieldRow = (props) => {
	const {
		group_level,
		onChange,
		onDuplicate,
		items = [],
		value,
		htmlId = id => id,
		className,
		index,
		collapsed = false,
		toggleCollapsed = () => null,
		appContext,
		buttons = {},
		disabled_buttons = [],
		group_title,
	} = props;

	const handleDelete = useCallback(() => onChange(null), [onChange]);

	const handleDuplicate = useCallback(() => onDuplicate(value), [onDuplicate, value]);

	const handleChange = useCallback((changedValue) => {
		const newValue = {
			...value,
			...changedValue,
		};

		if (JSON.stringify(newValue) !== JSON.stringify(value)) {
			onChange(newValue);
		}
	}, [onChange, value]);

	const getItemTitle = (item) => {
		const innerValue = value[item.id];
		const Field = getItemComponent(item);

		if (Field.getHumanTitle) {
			return Field.getHumanTitle(item, innerValue);
		}

		return innerValue;
	};

	const title = [...items]
		.sort((a, b) => (a.id === group_title) ? -1 : (b.id === group_title) ? 1 : 0)
		.map(getItemTitle)
		.filter(value => !!(typeof value === 'string' ? value.trim : value))
		.find(value => typeof value === 'string') || '';

	return (
		<div className={classnames('wcf-multi-group-row', className)}>
			<div className={classnames('wcf-multi-group-row__header')}>
				<span className={classnames('wcf-multi-group-row__title')} onClick={() => toggleCollapsed()}>
					#{index + 1}: {htmlDecode(title)}
				</span>
				<div className={classnames('wcf-multi-group-row__buttons')}>
					{!disabled_buttons.includes('duplicate') && (
						<CloneButton
							onClick={handleDuplicate}
							title={buttons.duplicate || __('Duplicate', 'wpify-custom-fields')}
						/>
					)}
					{!disabled_buttons.includes('delete') && (
						<CloseButton
							onClick={handleDelete}
							title={buttons.delete || __('Remove', 'wpify-custom-fields')}
						/>
					)}
				</div>
			</div>
				<div className={classnames('wcf-multi-group-row__content', {
					'wcf-multi-group-row__content--collapsed': collapsed,
				})}>
					<div className='wcf-multi-group-row__content-in'>
					{items.map((item) => {
						const Field = getItemComponent(item);

						return (
							<div key={item.id} className={classnames('wcf-multi-group-row__content-item')}>
								{!applyFilters('wcf_field_without_label', false, item.type) && (
									<ErrorBoundary>
										<label
											className={classnames('wcf-multi-group-row__content-item-label')}
											htmlFor={htmlId(item.id)}
											dangerouslySetInnerHTML={{ __html: item.title }}
										/>
									</ErrorBoundary>
								)}
								<ErrorBoundary>
									<Field
										{...item}
										id={item.id}
										htmlId={htmlId}
										group_level={group_level}
										onChange={value => handleChange({ [item.id]: value })}
										value={value && value[item.id]}
										appContext={appContext}
									/>
								</ErrorBoundary>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default MultiGroupFieldRow;
