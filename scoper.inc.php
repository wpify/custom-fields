<?php declare( strict_types=1 );

use Isolated\Symfony\Component\Finder\Finder;

$prefix = 'WpifyCustomFieldsDeps';

return array(
	'prefix'                     => $prefix,
	'finders'                    => array(
		Finder::create()
		      ->files()
		      ->ignoreVCS( true )
		      ->notName( '/LICENSE|.*\\.md|.*\\.dist|Makefile|composer\\.json|composer\\.lock/' )
		      ->exclude( [
			      'doc',
			      'test',
			      'test_old',
			      'tests',
			      'Tests',
			      'vendor-bin',
			      'node_modules',
			      'scoper.inc.php',
		      ] )
		      ->in( __DIR__ . '/deps/unprefixed' ),
		Finder::create()
		      ->append( array( __DIR__ . '/deps/unprefixed/composer.json' ) ),
	),
	'patchers'                   => array(
		function ( string $filePath, string $prefix, string $content ): string {
			if ( strpos( $filePath, 'guzzlehttp/guzzle/src/Handler/CurlFactory.php' ) !== false ) {
				$content = str_replace( 'stream_for($sink)', 'Utils::streamFor()', $content );
			}

			if ( strpos( $filePath, 'wpify/core/src' ) !== false ) {
				$content = str_replace( "\\$prefix\\WC", "\\WC", $content );
				$content = str_replace( "$prefix\\\\WC", '\\WC', $content );
				$content = str_replace( "\\$prefix\\WP", "\\WP", $content );
				$content = str_replace( "\\$prefix\\WC", '\\WP', $content );
			}

			return $content;
		},
	),
	'whitelist'                  => array(),
	'whitelist-global-constants' => true,
	'whitelist-global-classes'   => true,
	'whitelist-global-functions' => true,
);
