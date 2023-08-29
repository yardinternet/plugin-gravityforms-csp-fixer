<?php

namespace Yard\CSP\WordPress;

use Yard\CSP\Foundation\ServiceProvider;

class WordPressServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->plugin->loader->addAction('wp_enqueue_scripts', $this, 'enqueueReplacementScripts', 10, 0);
    }

    public function enqueueReplacementScripts(): void
    {
        // https://github.com/WordPress/WordPress/blob/master/wp-includes/js/dist/a11y.js unsafe inline style attribute
        wp_deregister_script('wp-a11y');
        wp_register_script('wp-a11y', sprintf('%s/resources/js/replacements/a11y.js', $this->plugin->getPluginUrl()), ['wp-dom-ready', 'wp-i18n'], false);
        wp_enqueue_style('wp-a11y-css', sprintf('%s/resources/js/replacements/a11y.css', $this->plugin->getPluginUrl()), [], false);
        
        // https://wordpress.stackexchange.com/questions/392802/deferring-script-wp-i18n-causes-a-console-error-wp-is-not-defined-gravityfor
        array_unshift(wp_scripts()->queue, 'wp-a11y');

        // https://github.com/WordPress/WordPress/blob/master/wp-includes/js/plupload/moxie.js unsafe inline style attribute
        wp_deregister_script('moxiejs');
        wp_enqueue_script('moxiejs', sprintf('%s/resources/js/replacements/moxie.js', $this->plugin->getPluginUrl()), [], '1.3.5', 1);
    }
}
