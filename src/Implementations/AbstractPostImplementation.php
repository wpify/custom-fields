<?php

namespace WpifyCustomFields\Implementations;

/**
 * Class AbstractPostImplementation
 * @package WpifyCustomFields\Implementations
 */
abstract class AbstractPostImplementation extends AbstractImplementation {
	/**
	 * @param number $post_id
	 *
	 * @return void
	 */
	abstract function set_post( $post_id );
}
