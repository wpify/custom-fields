import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { getItemComponent, renderField } from '../helpers';

const ItemWrapper = (item, index, isSectionOpen) => {
	if (item.noSection) {
		if (isSectionOpen) {
			return null;
		}
	}
};

const Options = (props) => {
	const { wcf = {}, className } = props;
	const { items = [] } = wcf;

	return (
		<table className={classnames('form-table', className)} role="presentation">
			<tbody>
			{items.map(item => {
				const Field = getItemComponent(item);

				return (
					<tr key={item.name} valign="top">
						{Field.noSection ? (
							<td colSpan={2} style={{ padding: 0 }}>
								<Field {...item} />
							</td>
						) : (
							<React.Fragment>
								<th scope="row" className="titledesc">
									<label htmlFor={item.id} dangerouslySetInnerHTML={{ __html: item.title }}/>
								</th>
								<td className={classnames('forminp', 'forminp-' + item.type)}>
									<Field {...item} />
								</td>
							</React.Fragment>
						)}
					</tr>
				);
			})}
			</tbody>
		</table>
	);
};

Options.propTypes = {
	className: PT.string,
	wcf: PT.object,
};

export default Options;
