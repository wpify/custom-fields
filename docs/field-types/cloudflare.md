# Cloudflare Field Type

The Cloudflare field type provides a multi-step UI for connecting your site to a Cloudflare domain. It stores credentials and zone information as an object, with a flow of: connect button → credentials form → zone selection → connected status.

## Field Type: `cloudflare`

```php
array(
	'type'  => 'cloudflare',
	'id'    => 'example_cloudflare',
	'label' => 'Cloudflare Zone',
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

This field type has no type-specific properties beyond the common field properties.

## Setup Requirements

To use the Cloudflare field type, you need:

1. A Cloudflare account with at least one domain (zone) added
2. Your Cloudflare account email address
3. Your Global API Key, available at [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens)

## User Flow

1. **Disconnected** — An orange "Connect to Cloudflare" button is displayed
2. **Credentials** — A form appears for entering email and Global API Key, with a link to the Cloudflare dashboard
3. **Zone Selection** — A paginated list of available zones is displayed; the user selects one
4. **Connected** — A card shows the connected zone name, account name, and a green "Connected" label with a Disconnect button

## Stored Value

The Cloudflare field stores an object with the following structure:

```php
array(
	'email'        => 'user@example.com',
	'api_key'      => 'your-global-api-key',
	'zone_id'      => 'abc123def456',
	'zone_name'    => 'example.com',
	'account_id'   => '789ghi012jkl',
	'account_name' => 'My Account',
)
```

## Example Usage

### Basic Cloudflare Zone Field

```php
array(
	'type'        => 'cloudflare',
	'id'          => 'cf_zone',
	'label'       => 'Cloudflare Zone',
	'description' => 'Connect your Cloudflare domain.',
	'required'    => true,
)
```

### Using Values in Your Theme

```php
$cf = get_option( 'my_settings' );
$zone = $cf['cf_zone'] ?? array();

if ( ! empty( $zone['zone_id'] ) ) {
	echo '<p>' . esc_html(
		sprintf(
			/* translators: %s: zone name */
			__( 'Connected to: %s', 'my-plugin' ),
			$zone['zone_name']
		)
	) . '</p>';
	echo '<p>' . esc_html(
		sprintf(
			/* translators: %s: account name */
			__( 'Account: %s', 'my-plugin' ),
			$zone['account_name']
		)
	) . '</p>';
}
```

### With Conditional Logic

```php
array(
	'type'  => 'toggle',
	'id'    => 'use_cloudflare',
	'label' => 'Use Cloudflare',
	'title' => 'Enable Cloudflare integration',
),
array(
	'type'        => 'cloudflare',
	'id'          => 'cf_zone',
	'label'       => 'Cloudflare Zone',
	'description' => 'Select the Cloudflare zone for this site.',
	'conditions'  => array(
		array( 'field' => 'use_cloudflare', 'value' => true ),
	),
)
```

### WP-CLI Command to Purge Cache

```php
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	WP_CLI::add_command( 'cloudflare purge', function () {
		$settings = get_option( 'my_settings' );
		$zone     = $settings['cf_zone'] ?? array();

		if ( empty( $zone['zone_id'] ) || empty( $zone['email'] ) || empty( $zone['api_key'] ) ) {
			WP_CLI::error( 'Cloudflare zone is not configured.' );
		}

		$response = wp_remote_request(
			'https://api.cloudflare.com/client/v4/zones/' . $zone['zone_id'] . '/purge_cache',
			array(
				'method'  => 'POST',
				'headers' => array(
					'X-Auth-Email' => $zone['email'],
					'X-Auth-Key'   => $zone['api_key'],
					'Content-Type' => 'application/json',
				),
				'body'    => wp_json_encode( array( 'purge_everything' => true ) ),
			)
		);

		if ( is_wp_error( $response ) ) {
			WP_CLI::error( $response->get_error_message() );
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( empty( $body['success'] ) ) {
			$message = $body['errors'][0]['message'] ?? 'Unknown error';
			WP_CLI::error( 'Cloudflare API error: ' . $message );
		}

		WP_CLI::success( 'Cache purged for ' . $zone['zone_name'] . '.' );
	} );
}
```

Usage:

```bash
wp cloudflare purge
```

### Admin Bar Button to Purge Cache

```php
add_action( 'admin_bar_menu', function ( WP_Admin_Bar $admin_bar ) {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$settings = get_option( 'my_settings' );
	$zone     = $settings['cf_zone'] ?? array();

	if ( empty( $zone['zone_id'] ) ) {
		return;
	}

	$admin_bar->add_node( array(
		'id'    => 'cloudflare-purge',
		'title' => 'Purge Cloudflare Cache',
		'href'  => wp_nonce_url( admin_url( 'admin-post.php?action=cloudflare_purge' ), 'cloudflare_purge' ),
	) );
}, 100 );

add_action( 'admin_post_cloudflare_purge', function () {
	if ( ! current_user_can( 'manage_options' ) || ! check_admin_referer( 'cloudflare_purge' ) ) {
		wp_die( esc_html__( 'Unauthorized', 'my-plugin' ) );
	}

	$settings = get_option( 'my_settings' );
	$zone     = $settings['cf_zone'] ?? array();

	if ( empty( $zone['zone_id'] ) || empty( $zone['email'] ) || empty( $zone['api_key'] ) ) {
		wp_die( esc_html__( 'Cloudflare zone is not configured.', 'my-plugin' ) );
	}

	$response = wp_remote_request(
		'https://api.cloudflare.com/client/v4/zones/' . $zone['zone_id'] . '/purge_cache',
		array(
			'method'  => 'POST',
			'headers' => array(
				'X-Auth-Email' => $zone['email'],
				'X-Auth-Key'   => $zone['api_key'],
				'Content-Type' => 'application/json',
			),
			'body'    => wp_json_encode( array( 'purge_everything' => true ) ),
		)
	);

	if ( is_wp_error( $response ) ) {
		wp_safe_redirect( add_query_arg( 'cf_purge', 'error', wp_get_referer() ) );
		exit;
	}

	$body = json_decode( wp_remote_retrieve_body( $response ), true );

	if ( empty( $body['success'] ) ) {
		wp_safe_redirect( add_query_arg( 'cf_purge', 'error', wp_get_referer() ) );
		exit;
	}

	wp_safe_redirect( add_query_arg( 'cf_purge', 'success', wp_get_referer() ) );
	exit;
} );

add_action( 'admin_notices', function () {
	if ( ! isset( $_GET['cf_purge'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		return;
	}

	$status = sanitize_text_field( wp_unslash( $_GET['cf_purge'] ) ); // phpcs:ignore WordPress.Security.NonceVerification

	if ( 'success' === $status ) {
		echo '<div class="notice notice-success is-dismissible"><p>';
		echo esc_html__( 'Cloudflare cache purged successfully.', 'my-plugin' );
		echo '</p></div>';
	} elseif ( 'error' === $status ) {
		echo '<div class="notice notice-error is-dismissible"><p>';
		echo esc_html__( 'Failed to purge Cloudflare cache.', 'my-plugin' );
		echo '</p></div>';
	}
} );
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->cloudflare(
	label: 'Cloudflare Zone',
	required: true,
);
```

## Notes

- The Global API Key is stored in the database alongside the field value; restrict access to the options/meta where this field is used
- The API call is proxied through the WordPress REST API — credentials are never sent directly from the browser to Cloudflare
- Pagination is supported for accounts with more than 50 domains
- Validation checks for `zone_id` presence when the `required` property is set to `true`
- When reconnecting, the credentials form is pre-populated from the previously stored email and API key
