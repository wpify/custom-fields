<?php

namespace Wpify\CustomFields;

/**
 * Class Assets
 * @package CustomFields
 */
final class Assets {
	/** @var string */
	private $assets_path;

	/** @var string */
	private $wcf_url;

	/** @var array */
	private $manifest = array();

	private $code_editor_settings = array();

	/**
	 * Assets constructor.
	 *
	 * @param $assets_path
	 */
	public function __construct( $assets_path, $wcf_url = '' ) {
		$this->assets_path = trailingslashit( $assets_path );
		$this->wcf_url     = $wcf_url;
	}

	/**
	 * @param string $file
	 * @param array $deps
	 * @param false $in_footer
	 * @param array $localize
	 */
	public function enqueue_script( string $file, array $deps = array(), $in_footer = false, $localize = array() ) {
		$handle = $this->register_script( $file, $deps, $in_footer, $localize );
		wp_enqueue_script( $handle );

		return $handle;
	}

	/**
	 * @param string $file
	 * @param array $deps
	 * @param false $in_footer
	 * @param array $localize
	 *
	 * @return mixed|null
	 */
	public function register_script( string $file, array $deps = array(), $in_footer = false, $localize = array() ) {
		$data = $this->get_file( $file );

		if ( empty( $data ) ) {
			return null;
		}

		if ( wp_register_script( $data['handle'], $data['src'], array_merge( $deps, $data['deps'] ), $data['ver'], $in_footer )
		     && ! empty( $localize )
		) {
			foreach ( $localize as $variable => $value ) {
				wp_add_inline_script(
					$data['handle'],
					'try { var ' . $variable . ' = ' . wp_json_encode( $value, JSON_UNESCAPED_UNICODE ) . '; } catch (e) { console.error(e); }',
					'before'
				);
			}
		}

		return $data['handle'];
	}

	/**
	 * @param $file
	 *
	 * @return mixed
	 */
	private function get_file( $file ) {
		$manifest = $this->get_manifest();

		if ( ! empty( $manifest[ $file ] ) ) {
			return $manifest[ $file ];
		}

		return null;
	}

	/**
	 * @return array
	 */
	private function get_manifest() {
		if ( empty( $this->manifest ) && file_exists( $this->assets_path . '/assets-manifest.json' ) ) {
			$deps = array();

			if ( file_exists( $this->assets_path . '/assets.php' ) ) {
				// phpcs:ignore
				$deps = require $this->assets_path . '/assets.php';
			}

			$data = file_get_contents( $this->assets_path . '/assets-manifest.json' );
			$json = json_decode( $data, true );

			foreach ( $json as $key => $filename ) {
				$path     = $this->assets_path . '/' . $filename;
				$pathinfo = pathinfo( $path );
				$item     = array(
					'path'   => $path,
					'src'    => $this->path_to_url( $path ),
					'handle' => 'wcf-' . $pathinfo['filename'] . '-' . $pathinfo['extension'],
				);

				if ( ! empty( $deps[ $key ] ) ) {
					$item['deps'] = $deps[ $key ]['dependencies'];
					$item['ver']  = $deps[ $key ]['version'];
				} else {
					$item['deps'] = array();
					$item['ver']  = null;
				}

				$this->manifest[ $key ] = $item;
			}
		}

		return $this->manifest;
	}

	/**
	 * @param string $path
	 *
	 * @return string
	 */
	public function path_to_url( string $path = '' ) {
		if ( ! empty( $this->wcf_url ) ) {
			if ( is_dir( $path ) && basename( $path ) === 'build' ) {
				return esc_url_raw( $this->wcf_url . '/build/' );
			}

			return esc_url_raw( $this->wcf_url . '/build/' . basename( $path ) );
		}

		return esc_url_raw(str_replace(
			wp_normalize_path( untrailingslashit( ABSPATH ) ),
			site_url(),
			wp_normalize_path( $path )
		));
	}

	/**
	 * @param string $file
	 * @param array $deps
	 * @param string $media
	 */
	public function enqueue_style( string $file, array $deps = array(), string $media = 'all' ) {
		wp_enqueue_style( $this->register_style( $file, $deps, $media ) );
	}

	/**
	 * @param string $file
	 * @param array $deps
	 * @param string $media
	 *
	 * @return mixed|null
	 */
	public function register_style( string $file, array $deps = array(), string $media = 'all' ) {
		$data = $this->get_file( $file );

		if ( empty( $data ) ) {
			return null;
		}

		wp_register_style( $data['handle'], $data['src'], array_merge( $deps, $data['deps'] ), $data['ver'], $media );

		return $data['handle'];
	}

	public function get_code_editor_settings() {
		if ( empty( $this->code_editor_settings ) ) {
			$modes = array(
				'css'        => 'application/x-httpd-php',
				'diff'       => 'diff',
				'html'       => 'htmlmixed',
				'gfm'        => 'gfm',
				'javascript' => 'javascript',
				'json'       => 'application/json',
				'jsonld'     => 'application/ld+json',
				'jsx'        => 'jsx',
				'markdown'   => 'markdown',
				'nginx'      => 'nginx',
				'php'        => 'php',
				'sql'        => 'sql',
				'xml'        => 'xml',
				'yaml'       => 'yaml',
			);

			foreach ( $modes as $mode => $type ) {
				$this->code_editor_settings[ $mode ] = wp_get_code_editor_settings( array( 'type' => $type ) );
			}
		}

		return $this->code_editor_settings;
	}

	/**
	 * @return string
	 */
	public function get_assets_path(): string {
		return $this->assets_path;
	}
}
