import React from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { getItemComponent } from '../helpers';

const Options = (props) => {
	const { wcf = {}, group_level, className } = props;
	const { items = [] } = wcf;

	return (
		<table className={classnames('form-table', className)} role="presentation" style={{ tableLayout: 'auto' }}>
			<tbody>
			{items.map(item => {
				const Field = getItemComponent(item);
				const noSection = group_level > 0 ? false : Field.noSection;

				return (
					<tr key={item.name} valign="top">
						{noSection ? (
							<td colSpan={2} style={{ padding: 0 }}>
								<Field {...props} {...item} />
							</td>
						) : (
							<React.Fragment>
								<th scope="row" className="titledesc">
									{!Field.noLabel && (
										<label htmlFor={item.id} dangerouslySetInnerHTML={{ __html: item.title }}/>
									)}
								</th>
								<td className={classnames('forminp', 'forminp-' + item.type)}>
									<Field {...props} {...item} />
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
	group_level: PT.number,
};

export default Options;
