<?php

namespace WpifyCustomFields;

/**
 * Class Assets
 * @package WpifyCustomFields
 */
final class Assets {
	/** @var string */
	private $assets_path;

	/** @var array */
	private $manifest = array();

	/**
	 * Assets constructor.
	 *
	 * @param $assets_path
	 */
	public function __construct( $assets_path ) {
		$this->assets_path = $assets_path;
	}

	/**
	 * @param string $file
	 * @param array $deps
	 * @param false $in_footer
	 * @param array $localize
	 */
	public function enqueue_script( string $file, array $deps = array(), $in_footer = false, $localize = array() ) {
		wp_enqueue_script( $this->register_script( $file, $deps, $in_footer, $localize ) );
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

		if ( wp_register_script( $data['handle'], $data['src'], array_merge( $deps, $data['deps'] ), $data['ver'], $in_footer ) ) {
			if ( ! empty( $localize ) ) {
				foreach ( $localize as $variable => $value ) {
					wp_localize_script( $data['handle'], $variable, $value );
				}
			}

			return $data['handle'];
		} else {
			return null;
		}
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
	private function path_to_url( string $path ) {
		$url = str_replace(
			wp_normalize_path( untrailingslashit( ABSPATH ) ),
			site_url(),
			wp_normalize_path( $path )
		);

		return esc_url_raw( $url );
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

		if ( wp_register_style( $data['handle'], $data['src'], array_merge( $deps, $data['deps'] ), $data['ver'], $media ) ) {
			return $data['handle'];
		} else {
			return null;
		}
	}
}
