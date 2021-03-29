<?php

namespace WpifyCustomFields\Implementations;

abstract class AbstractPostImplementation extends AbstractImplementation {
	abstract function set_post( $post_id );
}
