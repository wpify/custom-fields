import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { renderField } from '../helpers';

const Options = (props) => {
	const { wcf = {}, className } = props;
	const { items = [] } = wcf;

	return (
		<table className={classnames('form-table', className)} role="presentation">
			<tbody>
			{items.map(item => (
				<tr key={item.name}>
					<th scope="row">
						<label htmlFor={item.id || item.name} dangerouslySetInnerHTML={{ __html: item.label }}/>
					</th>
					<td>
						{renderField(item)}
					</td>
				</tr>
			))}
			</tbody>
		</table>
	);
};

Options.propTypes = {
	className: PT.string,
	wcf: PT.object,
};

export default Options;
