<?php
/**
 * Plugin Name: DGS Headless Bridge
 * Description: Keeps WordPress as a private CMS/forms backend while Next.js is the only public website.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

const DGS_PUBLIC_SITE_ORIGIN = 'https://www.dgeniussolutions.com';

function dgs_headless_is_backend_request(): bool {
    if (is_admin()) return true;
    if (defined('REST_REQUEST') && REST_REQUEST) return true;
    if (defined('DOING_AJAX') && DOING_AJAX) return true;
    if (defined('DOING_CRON') && DOING_CRON) return true;

    $path = wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    return $path === '/wp-login.php'
        || str_starts_with($path, '/wp-admin/')
        || str_starts_with($path, '/wp-json/')
        || str_starts_with($path, '/wp-content/uploads/');
}

add_action('send_headers', function () {
    header('X-Robots-Tag: noindex, nofollow, noarchive', true);
});

add_action('template_redirect', function () {
    if (dgs_headless_is_backend_request()) return;

    $requestUri = $_SERVER['REQUEST_URI'] ?? '/';
    $target = rtrim(DGS_PUBLIC_SITE_ORIGIN, '/') . $requestUri;
    wp_redirect($target, 301, 'DGS Headless Bridge');
    exit;
}, 0);

add_filter('wp_sitemaps_enabled', '__return_false');
add_filter('rank_math/sitemap/enable', '__return_false');

add_action('rest_api_init', function () {
    register_rest_route('dgs/v1', '/form-context', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => 'dgs_headless_form_context',
        'args' => [
            'form_id' => ['required' => true, 'sanitize_callback' => 'absint'],
            'post_id' => ['required' => false, 'sanitize_callback' => 'absint'],
        ],
    ]);
});

function dgs_headless_form_context(WP_REST_Request $request) {
    $formId = absint($request->get_param('form_id'));
    $postId = absint($request->get_param('post_id'));

    if (!$formId || !shortcode_exists('fluentform')) {
        return new WP_Error('dgs_form_unavailable', 'Fluent Forms is unavailable.', ['status' => 503]);
    }

    global $post;
    $previousPost = $post;
    if ($postId) {
        $candidate = get_post($postId);
        if ($candidate) {
            $post = $candidate;
            setup_postdata($post);
        }
    }

    $html = do_shortcode('[fluentform id="' . $formId . '"]');
    wp_reset_postdata();
    $post = $previousPost;

    $response = new WP_REST_Response([
        'form_id' => $formId,
        'post_id' => $postId,
        'html' => $html,
    ]);
    $response->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    $response->header('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return $response;
}
