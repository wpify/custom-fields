import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';

const Options = (props) => {
	const { wcf = {}, className } = props;
	const { items = [] } = wcf;

	return (
		<div className={classnames(className, 'options_group')}>
			{items.map((item) => {
				const Field = getItemComponent(item);

				return Field.noSection ? (
					<Field {...props} {...item} />
				) : (
					<p key={item.id} className="form-field">
						<label htmlFor={item.id} dangerouslySetInnerHTML={{ __html: item.title }}/>
						<Field {...props} {...item} />
					</p>
				);
			})}
		</div>
	);
};

Options.propTypes = {
	className: PT.string,
	wcf: PT.object,
};

export default Options;
