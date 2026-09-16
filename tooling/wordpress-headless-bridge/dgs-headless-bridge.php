<?php
/**
 * Plugin Name: DGS Headless Bridge
 * Description: Keeps WordPress as a private CMS/forms backend while Next.js is the only public website.
 * Version: 1.1.1
 */

if (!defined('ABSPATH')) {
    exit;
}

$dgs_public_origin = 'https://www.dgeniussolutions.com';

add_action('init', static function () {
    $path = wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $is_sitemap = $path === '/wp-sitemap.xml'
        || $path === '/sitemap_index.xml'
        || preg_match('~/(?:[^/]+-)?sitemap\d*\.xml$~', $path);

    if (!$is_sitemap) return;

    status_header(404);
    nocache_headers();
    header('X-Robots-Tag: noindex, nofollow, noarchive', true);
    exit;
}, 0);

$dgs_is_backend_request = static function (): bool {
    if (is_admin()) return true;
    if (defined('REST_REQUEST') && REST_REQUEST) return true;
    if (function_exists('wp_doing_ajax') && wp_doing_ajax()) return true;
    if (function_exists('wp_doing_cron') && wp_doing_cron()) return true;

    $path = wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    if ($path === '/wp-login.php' || $path === '/wp-admin' || $path === '/wp-cron.php') return true;
    if (strpos($path, '/wp-admin/') === 0) return true;
    if (strpos($path, '/wp-json/') === 0) return true;
    if (strpos($path, '/wp-content/uploads/') === 0) return true;
    return false;
};
add_action('send_headers', static function () {
    header('X-Robots-Tag: noindex, nofollow, noarchive', true);
});

add_action('template_redirect', static function () use ($dgs_is_backend_request, $dgs_public_origin) {
    if ($dgs_is_backend_request()) return;

    $request_uri = $_SERVER['REQUEST_URI'] ?? '/';
    $target = rtrim($dgs_public_origin, '/') . $request_uri;
    wp_redirect($target, 301, 'DGS Headless Bridge');
    exit;
}, 0);

add_filter('wp_sitemaps_enabled', '__return_false');
add_filter('rank_math/sitemap/enable', '__return_false');

add_action('rest_api_init', static function () {
    register_rest_route('dgs/v1', '/form-context', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => static function (WP_REST_Request $request) {
            $form_id = absint($request->get_param('form_id'));
            $post_id = absint($request->get_param('post_id'));

            if (!$form_id || !shortcode_exists('fluentform')) {
                return new WP_Error('dgs_form_unavailable', 'Fluent Forms is unavailable.', ['status' => 503]);
            }

            global $post;
            $previous_post = $post;

            if ($post_id) {
                $candidate = get_post($post_id);
                if ($candidate) {
                    $post = $candidate;
                    setup_postdata($post);
                }
            }

            $html = do_shortcode('[fluentform id="' . $form_id . '"]');
            wp_reset_postdata();
            $post = $previous_post;

            $response = new WP_REST_Response([
                'form_id' => $form_id,
                'post_id' => $post_id,
                'html' => $html,
            ]);
            $response->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
            $response->header('X-Robots-Tag', 'noindex, nofollow, noarchive');
            return $response;
        },
        'args' => [
            'form_id' => ['required' => true, 'sanitize_callback' => 'absint'],
            'post_id' => ['required' => false, 'sanitize_callback' => 'absint'],
        ],
    ]);
});
