import React, { useCallback, useContext } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { applyFilters } from '@wordpress/hooks';
import ErrorBoundary from '../components/ErrorBoundary';
import { getItemComponent } from '../helpers';
import ScreenContext from '../components/ScreenContext';

const GroupFieldRow = (props) => {
	console.log('GroupFieldRow', props);

	const { item, group_level, appContext, onChange, className, value } = props;
	const { id } = item;
	const { RowWrapper } = useContext(ScreenContext);
	const Field = getItemComponent(item);

	const handleChange = useCallback((changedValue) => {
		onChange({ [id]: changedValue });
	}, [id, onChange]);

	return (
		<RowWrapper
			className={classnames(className)}
			item={item}
			group_level={group_level + 1}
			htmlId={itemId => id + '_' + itemId}
			withoutWrapper={applyFilters('wcf_field_without_wrapper', false, item.type, group_level)}
			withoutLabel={applyFilters('wcf_field_without_label', false, item.type)}
			withoutSection={applyFilters('wcf_field_without_section', false, item.type)}
		>
			<ErrorBoundary>
				<Field
					{...item}
					htmlId={itemId => id + '_' + itemId}
					group_level={group_level + 1}
					onChange={handleChange}
					value={value}
					appContext={appContext}
				/>
			</ErrorBoundary>
		</RowWrapper>
	);
};

GroupFieldRow.propTypes = {
	className: PT.string,
	item: PT.object,
	group_level: PT.number,
	id: PT.string,
	appContext: PT.object,
	value: PT.any,
	onChange: PT.func,
};

export default GroupFieldRow;
