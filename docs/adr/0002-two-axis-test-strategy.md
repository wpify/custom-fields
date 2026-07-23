# Two-axis test strategy with named exceptions

The plugin exposes 59 field types across 15 integration surfaces — 885
combinations, untestable as a matrix. Because field types don't know which
integration hosts them (they read values from `AppContext` and emit hidden
inputs) and integrations don't know which field types they contain (they
normalize and save generically through `OptionsIntegration`/`ItemsIntegration`),
we test the two axes independently: the field-type axis is exercised once
through the Canonical integration (Options), and the integration axis is
exercised with a small representative field set per surface at the PHP level.

Cross-axis couplings that break this independence are tracked as Named
exceptions with dedicated tests: Gutenberg's controlled state (a different data
path than form submission), `multi_*`/`group` nested value shapes, and
WooCommerce variation index-suffixed input names. Any future bug that crosses
the axes must be added to that list rather than dissolving the decomposition.

## Consequences

- Only the Options surface sees all field types in tests; the other 14
  surfaces rely on the shared save/load path for field-type correctness.
- The test suite is an hourglass, not a pyramid: JS unit tests for helper
  logic and a jsdom Mount-sweep over all field components, PHP integration
  tests (wp-phpunit, two suites: core without WooCommerce and a WooCommerce
  suite) as the data-integrity core, and a browser E2E Smoke set of exactly
  8 specs — 12 of the 15 surfaces intentionally have no browser tests.
