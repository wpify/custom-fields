<?php

namespace WpifyCustomFields\Managers;

use WpifyCustomFields\Plugin;
use WpifyCustomFields\Repositories\OptionsPageRepository;
use WpifyCustomFieldsDeps\Wpify\Core\Abstracts\AbstractManager;

/**
 * Class RepositoriesManager
 *
 * @package Wpify\Managers
 * @property Plugin $plugin
 */
class RepositoriesManager extends AbstractManager {
	protected $modules = array(
		OptionsPageRepository::class,
	);
}
