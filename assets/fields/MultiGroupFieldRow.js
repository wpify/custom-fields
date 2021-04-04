import React, { useState } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';
import { getItemComponent } from '../helpers';
import CloseButton from '../components/CloseButton';
import MoveButton from '../components/MoveButton';

const MultiGroupFieldRow = (props) => {
	const {
		group_level,
		onChange,
		items = [],
		value,
		htmlId = id => id,
		className,
		index,
		collapsed: defaultCollapsed = Object.values(value).length > 1,
		length = 0,
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
				{length > 0 && (
					<MoveButton />
				)}
				<span className={classnames('wcf-multi-group-row__title')} onClick={() => setCollapsed(!collapsed)}>
					#{index + 1}: {title}
				</span>
				<CloseButton onClick={handleDelete} />
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
