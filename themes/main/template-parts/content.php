<div class="container">
  <article id="post-<?php the_ID(); ?>" <?php echo post_class(); ?>>
	<header>
	  <?php if ( is_sticky() && is_home() && ! is_paged() ) : ?>
		<span class="sticky-post">
			<?php echo _x( 'Featured', 'post', 'wpify' ); ?>
		</span>
	  <?php endif; ?>

	  <?php if ( is_singular() ) : ?>
		<h1>
			<?php the_title(); ?>
		</h1>
	  <?php else : ?>
		<h2>
		  <a href="<?php echo esc_url( get_permalink() ); ?>">
			<?php the_title(); ?>
		  </a>
		</h2>
	  <?php endif; ?>
	</header>

	<div>
	  <?php the_content(); ?>
	</div>

	<footer>
	  <?php wp_link_pages(); ?>
	</footer>
  </article>
</div>
