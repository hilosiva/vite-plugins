<?php get_header(); ?>
<main>

  <h1>TEeaaaaaaa</h1>

  <?php get_template_part('template/hero'); ?>
  <?php if (have_posts()) : ?>
    <?php while (have_posts()): the_post(); ?>
      <!-- 繰り返し処理する内容 -->
      <?php the_title(); ?>
    <?php endwhile; ?>
  <?php endif; ?>
</main>


<?php get_footer(); ?>
