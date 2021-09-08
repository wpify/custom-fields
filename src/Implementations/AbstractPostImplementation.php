<?php

namespace Wpify\CustomFields\Implementations;

/**
 * Class AbstractPostImplementation
 * @package CustomFields\Implementations
 */
abstract class AbstractPostImplementation extends AbstractImplementation {
	/**
	 * @param number $post_id
	 *
	 * @return void
	 */
	abstract function set_post( $post_id );
}
