<?php

namespace WpifyCustomFields\Repositories;

use WpifyCustomFields\OptionsPage;
use WpifyCustomFieldsDeps\Wpify\Core\Abstracts\AbstractComponent;

class OptionsPageRepository extends AbstractComponent {
	/** @var OptionsPage[] */
	private $options_pages = array();

	public function setup() {
		$options_pages = apply_filters( 'wpify_custom_fields_options_pages', array() );

		foreach ( $options_pages as $options_page ) {
			if ( empty( $options_page['menu_slug'] ) ) {
				continue;
			}

			if ( ! $this->get_by_menu_slug( $options_page['menu_slug'] ) ) {
				/** @var AbstractComponent $component */
				$component = $this->create_component( OptionsPage::class, array( 'args' => $options_page ) );

				if ( $component ) {
					$this->try_init($component);
					$this->options_pages[] = $component;
				}
			}
		}
	}

	/**
	 * @param string $slug
	 *
	 * @return ?OptionsPage
	 */
	public function get_by_menu_slug( string $slug ) {
		foreach ( $this->options_pages as $options_page ) {
			if ( $options_page->get_menu_slug() ) {
				return $options_page;
			}

			return null;
		}
	}
}
