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

	private $found_files = [];
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
	 *
	 * @return mixed|null
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

		if ( wp_register_script( $data['handle'], $data['src'], array_merge( $deps, $data['dependencies'] ), $data['version'], $in_footer )
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
		if (array_key_exists($file, $this->found_files)) {
			return $this->found_files[$file];
		}
		$asset_path = trailingslashit( $this->assets_path ) . preg_replace( "/\.\S+$/", '.asset.php', $file );
		$path       = trailingslashit( $this->assets_path ) . $file;
		$pathinfo   = pathinfo( $path );
		$manifest   = file_exists( $asset_path )
			? require $asset_path
			: array( 'dependencies' => array(), 'version' => null );

		if ( $pathinfo['extension'] === 'css' ) {
			$manifest['dependencies'] = array();
		}

		$manifest['path']   = $path;
		$manifest['src']    = $this->path_to_url( $path );
		$manifest['handle'] = 'wcf-' . $pathinfo['filename'] . '-' . $pathinfo['extension'];

		$this->found_files[$file] = $manifest;
		return $manifest;
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

		return esc_url_raw( str_replace(
			wp_normalize_path( untrailingslashit( ABSPATH ) ),
			site_url(),
			wp_normalize_path( $path )
		) );
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

		wp_register_style( $data['handle'], $data['src'], array_merge( $deps, $data['dependencies'] ), $data['version'], $media );

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
