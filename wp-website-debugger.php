<?php
/*
    Plugin Name: Website Debugger
    Description: Un plugin qui permet de déboguer le front-end d'un site internet
    Version: 1.0.0
    Author: Mathieu Gallais de Chateaucroc
*/

function wd_activate() {
    add_option('wd_debug_mode', 'true');
}

register_activation_hook(__FILE__, 'wd_activate');

function wd_register_settings() {
    register_setting('wd_options_group', 'wd_debug_mode');
}

add_action('admin_init', 'wd_register_settings');

function wd_admin_bar_menu($admin_bar) {
    $debug_mode = get_option('wd_debug_mode');

    $admin_bar->add_menu(array(
        'id'    => 'website-debugger',
        'title' => 'Mode débogage',
        'href'  => admin_url('options-general.php?page=website_debugger'),
        'meta'  => array(
            'title' => __('Activer/Désactiver le mode débogage'),
        ),
    ));

    $admin_bar->add_menu(array(
        'id'     => 'wd_toggle_debug_mode',
        'parent' => 'website-debugger',
        'title'  => $debug_mode === 'true' ? 'Désactiver' : 'Activer',
        'href'   => wp_nonce_url(admin_url('admin-post.php?action=toggle_debug_mode'), 'toggle_debug_mode_nonce'),
        'meta'   => array(
            'title' => __('Cliquez pour activer/désactiver le mode débogage'),
        ),
    ));
}

add_action('admin_bar_menu', 'wd_admin_bar_menu', 100);

function wd_toggle_debug_mode() {
    check_admin_referer('toggle_debug_mode_nonce');

    $current_mode = get_option('wd_debug_mode');
    update_option('wd_debug_mode', $current_mode === 'true' ? 'false' : 'true');

    wp_redirect(wp_get_referer());
    exit;
}

add_action('admin_post_toggle_debug_mode', 'wd_toggle_debug_mode');

function wd_enqueue_scripts() {
    if (!current_user_can('administrator')) {
        return;
    }

    if (!wp_style_is('font-awesome', 'enqueued')) {
        wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
    }

    wp_enqueue_script('website-debugger', plugin_dir_url(__FILE__) . 'wp-website-debugger.min.js', array(), '1.0', true);

    wp_localize_script('website-debugger', 'wd_debug', array(
        'is_debug' => get_option('wd_debug_mode') === 'true'
    ));
}

add_action('wp_enqueue_scripts', 'wd_enqueue_scripts');