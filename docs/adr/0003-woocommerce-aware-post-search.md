# WooCommerce-aware post search lives in Helpers

`Helpers::get_posts()` backs the `posts` REST endpoint that the Post, Multi Post,
and Link fields read from. When the queried post types include `product` or
`product_variation` and WooCommerce is active, it now also searches
`wc_product_meta_lookup.sku`, ranks exact SKU matches first, and returns a `sku`
key on every post so the pickers can display it.

That means a generic module carries WooCommerce knowledge. Two alternatives were
rejected:

**A generic `search_meta` field property.** Fields would declare which meta keys
are searchable and how options are labelled, with WooCommerce as a documented
preset. It keeps `Helpers` domain-neutral, but it is a public API surface to
support forever, and products would not work until a user opted in. The concrete
need is products; the generic need is hypothetical.

**Delegating to `WC_Product_Data_Store_CPT::search_products()`.** WooCommerce
maintains that SQL and it already covers SKU and `global_unique_id`. But it
ignores every other argument the endpoint forwards (`exclude`, `ensure`,
`numberposts`, taxonomy args), restricts statuses to publish/private, orders by
`post_parent, post_title` rather than relevance, and injects the parent ID of
every match — so searching a variation SKU would also return its parent product.
Reconciling its result set with our own arguments is more code, and more
surprising code, than the join.

We therefore add the join ourselves through `posts_search`, `posts_join`, and
`posts_orderby` filters, scoped to the single query by a `wpifycf_search_sku`
query var. Behaviour is gated on `$wpdb->wc_product_meta_lookup` being
registered, which is WooCommerce's own signal that it is loaded, and can be
overridden with the `wpifycf_search_posts_by_sku` filter.

## Consequences

- The SKU-aware query runs with `suppress_filters => false`, unlike every other
  query `get_posts()` makes here — `get_posts()` suppresses the `posts_*` clause
  filters by default and the search is implemented through them. Third-party
  clause filters therefore also apply to that one query.
- SKU matching is substring (`LIKE %term%`), which cannot use an index on the
  lookup table. Acceptable at picker scale (50 rows, debounced), not something
  to reuse for front-end catalogue search.
- `global_unique_id` (GTIN/UPC/EAN) is not searched, even though WooCommerce
  searches it. The column only exists from WooCommerce 9.2, and referencing a
  missing column is a SQL error rather than a silent miss; adding it later means
  detecting the column first.
- Variations match on their own SKU only. WooCommerce additionally falls back to
  the parent's SKU for variations that have none; we do not.
- The `sku` key is now part of the endpoint's public payload and is always
  present, so JavaScript never branches on whether a request was product-shaped.
