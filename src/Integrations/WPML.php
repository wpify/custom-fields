<?php

namespace Wpify\CustomFields\Integrations;

class WPML {
	public function __construct() {
		if ( defined( 'ICL_LANGUAGE_CODE' ) ) {
			add_filter( 'wcf_options_items', [ $this, 'adjust_items' ], 10 );
			add_filter( 'wcf_woocommerce_settings_items', [ $this, 'adjust_items' ], 10 );
		}
	}

	public function adjust_option_name( $id, $item ) {
		if ( ! empty( $item['integrations']['wpml'] ) ) {
			$id = sprintf( '%s_%s', $id, ICL_LANGUAGE_CODE );
		}

		return $id;
	}

	public function adjust_items( $items ) {
		foreach ( $items as $key => $item ) {
			if ( ! empty( $item['integrations']['wpml'] ) ) {
				$items[$key]['id'] = sprintf( '%s_%s', $item['id'], ICL_LANGUAGE_CODE );
			}
		}

		return $items;
	}
}
