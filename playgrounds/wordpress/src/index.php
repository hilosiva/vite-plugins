<?php get_header(); ?>
<main>

  <h1>1aa441</h1>

  <?php get_template_part('template/hero'); ?>
  <?php if (have_posts()) : ?>
    <?php while (have_posts()): the_post(); ?>
      <!-- 繰り返し処理する内容 -->
      <?php the_title(); ?>

      <?php echo get_template_directory_uri(); ?>
    <?php endwhile; ?>
  <?php endif; ?>
</main>


<?php get_footer(); ?>
