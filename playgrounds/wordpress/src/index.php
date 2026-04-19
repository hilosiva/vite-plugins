<?php get_header(); ?>
<main>

  <h1>aaaasss</h1>
  <figure class="hero__figure">
    <img src="<?php echo esc_url(THEME_URL); ?>/assets/images/cover.jpg" alt="">
  </figure>
  <?php get_template_part('template/hero'); ?>
  <?php if (have_posts()) : ?>
    <?php while (have_posts()): the_post(); ?>
      <!-- 繰り返し処理する内容 -->
      <?php the_title(); ?>
      <img src="<?php  ?>" alt="">

    <?php endwhile; ?>
  <?php endif; ?>
</main>


<?php get_footer(); ?>
