# PHP integration tests

Real-WordPress integration tests for WPify Custom Fields, built on
[`wp-phpunit`](https://github.com/wp-phpunit/wp-phpunit). They exercise the
plugin's data-integrity core — sanitization, type mapping, normalization, and
the save/load round-trip through every integration surface — against an actual
WordPress (and, for one suite, WooCommerce) install.

The strategy behind the two axes (field-type axis vs. integration axis) is
documented in [`docs/adr/0002-two-axis-test-strategy.md`](../../docs/adr/0002-two-axis-test-strategy.md).

## Layout

```
tests/php/
  bootstrap.php            # boots wp-phpunit; loads WooCommerce for the WC suite
  wp-tests-config.php      # DB + ABSPATH config (env-overridable)
  Support/                 # base TestCase, ProbeOptions, field-type catalogue, traits
  Core/                    # "core" suite — runs WITHOUT WooCommerce
    FieldType/             # sanitization, wp_type, defaults, normalization (field-type axis)
    Integration/           # Options round-trip (canonical axis) + per-surface round-trips
    *.php                  # REST API, meta registration, Gutenberg, nested multi_group, no-WC degradation
  WooCommerce/             # "woocommerce" suite — runs WITH WooCommerce loaded
```

## Two suites

| Suite | Command | WooCommerce | Site mode |
|---|---|---|---|
| `core` | `composer test` | absent | multisite |
| `woocommerce` | `composer test:wc` | loaded + installed | single site |

The core suite runs in **multisite** so the `SiteOptions` (blog options) and
network `Options` surfaces are covered; every other core test is site-mode
agnostic. The WooCommerce suite runs single-site and installs WooCommerce's
tables in-process (`WC_Install::install()` on `setup_theme`).

## Dependencies

Everything is self-contained via Composer — no reliance on the DDEV site:

- `wp-phpunit/wp-phpunit` + `roots/wordpress-no-content` — the WP test framework
  and WordPress core (installed to `vendor/wordpress`).
- `wpackagist-plugin/woocommerce` — installed to
  `vendor/wordpress/wp-content/plugins/woocommerce`.
- `phpunit/phpunit` `^9.6`, `yoast/phpunit-polyfills`.

Run `composer install` to fetch them.

## Running locally (DDEV)

The suite needs a MySQL server and its own database — **never** point it at the
dev site's database (the WP test suite drops and recreates tables). Create a
dedicated database once on the DDEV MariaDB server:

```bash
echo "CREATE DATABASE IF NOT EXISTS wpcf_tests; GRANT ALL ON wpcf_tests.* TO 'db'@'%';" | ddev mysql -uroot -proot
```

Then run the suites through the DDEV web container (PHP 8.3), which reaches the
`db` service directly:

```bash
ddev exec composer test        # core suite (multisite, no WooCommerce)
ddev exec composer test:wc     # WooCommerce suite
ddev exec composer test:all    # both
```

Inside DDEV the database defaults (host `db`, user/pass `db`) are detected
automatically via `IS_DDEV_PROJECT`; outside DDEV they default to a localhost
server with `root`/`root`. Override any of them with `WPCF_DB_HOST`,
`WPCF_DB_USER`, `WPCF_DB_PASSWORD`, `WPCF_DB_NAME`.

## Running in CI

`.github/workflows/tests.yml` runs both suites against a MariaDB service
container on PHP 8.1. The database credentials are supplied through the
`WPCF_DB_*` environment variables.

## Skipped tests

- `PaidExtensionsTest` — `SubscriptionMetabox` and `WcMembershipPlanOptions`
  target the paid WooCommerce Subscriptions / Memberships extensions, which are
  not part of the self-contained dependency set; these round-trips are skipped.
- `SiteOptionsTest` skips itself when the suite is not run in multisite mode
  (blog options require a multisite install).
