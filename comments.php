<?php
/**
 * The template for displaying comments.
 *
 * The area of the page that contains both current comments
 * and the comment form.
 *
 * @package c9
 */

/*
 * If the current post is protected by a password and
 * the visitor has not yet entered the password we will
 * return early without loading the comments.
 */
if ( post_password_required() ) {
	return;
}
?>

<div class="comments-area" id="comments">

	<?php if ( have_comments() ) : ?>

		<h2 class="comments-title">

			<?php
			$comments_number = get_comments_number();
			if ( 1 === (int) $comments_number ) {
				printf(
					/* translators: %s: post title */
					esc_html_x( 'One thought on &ldquo;%s&rdquo;', 'comments title', 'c9-togo' ),
					'<span>' . get_the_title() . '</span>'
				);
			} else {
				printf( // WPCS: XSS OK.
					/* translators: 1: number of comments, 2: post title */
					esc_html(
						_nx(
						'%1$s thought on &ldquo;%2$s&rdquo;',
						'%1$s thoughts on &ldquo;%2$s&rdquo;',
						$comments_number,
						'comments title',
						'c9-togo'
					)
						),
					number_format_i18n( $comments_number ),
					'<span>' . get_the_title() . '</span>'
				);
			}
			?>

		</h2><!-- .comments-title -->

		<?php
		if ( get_comment_pages_count() > 1 && get_option( 'page_comments' ) ) :
			?>

			<nav class="comment-navigation" id="comment-nav-above">

				<h1 class="screen-reader-text"><?php esc_html_e( 'Comment navigation', 'c9-togo' ); ?></h1>

				<?php if ( get_previous_comments_link() ) { ?>
					<div class="nav-previous">
					<?php
					previous_comments_link(
						__(
													'&larr; Older Comments',
													'c9-togo'
												)
						);
												?>
												</div>
				<?php
				}
			if ( get_next_comments_link() ) {
					?>
					<div class="nav-next">
					<?php
					next_comments_link(
						__(
												'Newer Comments &rarr;',
												'c9-togo'
											)
							);
												?>
											</div>
						<?php } ?>

			</nav><!-- #comment-nav-above -->

		<?php
		endif;
	?>

		<ol class="comment-list">

			<?php
			wp_list_comments(
				array(
					'style'       => 'ol',
					'short_ping'  => true,
					'avatar_size' => 80,
				)
				);
			?>

		</ol><!-- .comment-list -->

		<?php
		if ( get_comment_pages_count() > 1 && get_option( 'page_comments' ) ) :
			?>

			<nav class="comment-navigation" id="comment-nav-below">

				<h1 class="screen-reader-text"><?php esc_html_e( 'Comment navigation', 'c9-togo' ); ?></h1>

				<?php if ( get_previous_comments_link() ) { ?>
					<div class="nav-previous">
					<?php
					previous_comments_link(
						__(
													'&larr; Older Comments',
													'c9-togo'
												)
						);
												?>
												</div>
				<?php
				}
			if ( get_next_comments_link() ) {
					?>
					<div class="nav-next">
					<?php
					next_comments_link(
						__(
												'Newer Comments &rarr;',
												'c9-togo'
											)
							);
												?>
											</div>
						<?php } ?>

			</nav><!-- #comment-nav-below -->

		<?php
		endif;
	?>

	<?php
	endif;
?>

	<?php
	// If comments are closed and there are comments, let's leave a little note, shall we?
	if ( ! comments_open() && '0' != get_comments_number() && post_type_supports( get_post_type(), 'comments' ) ) :
		?>

		<p class="no-comments"><?php esc_html_e( 'Comments are closed.', 'c9-togo' ); ?></p>

	<?php endif; ?>

	<?php
	comment_form();
	?>

</div><!-- #comments -->
