import React from 'react';
import PostField from './PostField';

const MultiPostField = (props) => {
	return (
		<PostField {...props} isMulti/>
	);
};

export default MultiPostField;
