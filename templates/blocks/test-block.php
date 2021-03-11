<?php
/** @var $args array Template arguments */

if ( empty( ABSPATH ) ) {
  exit;
}

$attributes = empty( $args['attributes'] ) ? [] : $args['attributes'];
$title      = $attributes['title'];
$content    = $attributes['content'];
?>
<div class="block-test-block">
  <?php if ( ! empty( $title ) ): ?>
    <h2>
      <?php echo $title; ?>
    </h2>
  <?php endif; ?>
  <?php if ( ! empty( $content ) ): ?>
    <p>
      <?php echo $content; ?>
    </p>
  <?php endif; ?>
</div>
