<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
  <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
  <?php wp_body_open(); ?>
  <div class="site-wrapper scroll">
	<header class="site-header">
	  <div class="container">
		<nav class="navbar">
		  <?php get_template_part( 'template-parts/custom-logo' ); ?>
		</nav>
	</header>
	<main class="site-content">
