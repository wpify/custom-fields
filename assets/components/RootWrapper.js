import React from 'react';
import PT from 'prop-types';
import Options from './Options';
import Metabox from './Metabox';
import ProductOptions from './ProductOptions';
import AddTaxonomy from './AddTaxonomy';
import EditTaxonomy from './EditTaxonomy';
import InnerGroup from './InnerGroup';

const RootWrapper = (props) => {
	const { object_type, group_level } = props;

	if (group_level > 1) {
		return <InnerGroup {...props} />;
	}

	if (['options_page', 'woocommerce_settings'].includes(object_type)) {
		return <Options {...props} />;
	}

	if (object_type === 'metabox') {
		return <Metabox {...props} />;
	}

	if (object_type === 'product_options') {
		return <ProductOptions {...props} />;
	}

	if (object_type === 'add_taxonomy') {
		return <AddTaxonomy {...props} />;
	}

	if (object_type === 'edit_taxonomy') {
		return <EditTaxonomy {...props} />;
	}

	return null;
};

RootWrapper.propTypes = {
	object_type: PT.string,
	group_level: PT.string,
  className: PT.string,
};

export default RootWrapper;
