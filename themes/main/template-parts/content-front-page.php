<?php

use WpifyCustomFields\Controllers\FrontPageController;

/** @var FrontPageController */
$controller = wpify_custom_fields()->get_controller( FrontPageController::class );

$posts = $controller->get_posts();
?>
<pre>Total number of posts: <?php echo count( $posts ); ?></pre>
<p>
  <?php the_content(); ?>
</p>
