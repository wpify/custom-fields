import React from 'react';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';
import Button from '../components/Button';

const MultiGroupFieldRow = (props) => {
	const {
		group_level,
		onChange,
		items = [],
		value,
		htmlId = id => id
	} = props;

	const handleDelete = () => onChange(null);

	return (
		<div>
			{items.map(item => {
				const Field = getItemComponent(item);

				const handleChange = (changed) => onChange({ ...value, ...changed });

				return (
					<div key={item.id}>
						{!Field.noLabel && (
							<React.Fragment>
								<label
									htmlFor={htmlId(item.id)}
									dangerouslySetInnerHTML={{ __html: item.title }}
								/>
								<br/>
							</React.Fragment>
						)}
						<Field
							{...item}
							id={item.id}
							htmlId={htmlId}
							group_level={group_level}
							onChange={handleChange}
							value={value[item.id]}
						/>
					</div>
				)
			})}
			<div>
				<Button onClick={handleDelete}>Delete</Button>
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
