import React, { useState } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import { getItemComponent } from '../helpers';

const MultiGroupFieldRow = (props) => {
	const {
		group_level,
		onChange,
		items = [],
		value,
		htmlId = id => id,
		className,
		index,
		collapsed: defaultCollapsed = Object.values(value).length > 0,
	} = props;

	const [collapsed, setCollapsed] = useState(defaultCollapsed)
	const handleDelete = () => onChange(null);

	const handleChange = (changedValue) => {
		const newValue = {
			...value,
			...changedValue,
		};

		onChange(newValue);
	};

	const title = items.map(item => value[item.id]).find(value => typeof value === 'string');

	return (
		<div className={classnames('wcf-multi-group-row', className)}>
			<h4 className={classnames('wcf-multi-group-row__header')}>
				<button
					type="button"
					onClick={handleDelete}
					className={classnames('wcf-multi-group-row__button wcf-multi-group-row__button--move')}
				>
					<svg width={10} height={10} viewBox="0 0 10 10">
						<line stroke="#50575e" strokeWidth={2} x1={2} y1={0} x2={2} y2={10} />
						<line stroke="#50575e" strokeWidth={2} x1={6} y1={0} x2={6} y2={10} />
					</svg>
				</button>
				<span className={classnames('wcf-multi-group-row__title')} onClick={() => setCollapsed(!collapsed)}>
					#{index + 1}: {title}
				</span>
				<button
					type="button"
					onClick={handleDelete}
					className={classnames('wcf-multi-group-row__button wcf-multi-group-row__button--delete')}
				>
					<svg width={10} height={10} viewBox="0 0 10 10">
						<line stroke="#50575e" strokeWidth={2} x1={1} y1={9} x2={9} y2={1} />
						<line stroke="#50575e" strokeWidth={2} x1={1} y1={1} x2={9} y2={9} />
					</svg>
				</button>
			</h4>
			<div className={classnames('wcf-multi-group-row__content', {
				'wcf-multi-group-row__content--collapsed': collapsed,
			})}>
				{items.map((item) => {
					const Field = getItemComponent(item);

					return (
						<div key={item.id} className={classnames('wcf-multi-group-row__content-item')}>
							{!Field.noLabel && (
								<label
									className={classnames('wcf-multi-group-row__content-item-label')}
									htmlFor={htmlId(item.id)}
									dangerouslySetInnerHTML={{ __html: item.title }}
								/>
							)}
							<Field
								{...item}
								id={item.id}
								htmlId={htmlId}
								group_level={group_level}
								onChange={value => handleChange({ [item.id]: value })}
								value={value[item.id]}
							/>
						</div>
					)
				})}
			</div>
		</div>
	);
};

MultiGroupFieldRow.propTypes = {
	index: PT.number,
	group_level: PT.number,
	onChange: PT.func,
	items: PT.array,
	value: PT.object,
	htmlId: PT.func,
};

export default MultiGroupFieldRow;
