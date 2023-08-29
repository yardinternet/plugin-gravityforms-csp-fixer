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
        $wp_scripts = wp_scripts();

        // https://github.com/WordPress/WordPress/blob/master/wp-includes/js/dist/a11y.js unsafe inline style attribute
        if ( isset( $wp_scripts->registered['wp-a11y'] ) ) {
            $wp_scripts->registered['wp-a11y']->src = sprintf('%s/resources/js/replacements/a11y.js', $this->plugin->getPluginUrl());
        }
        wp_enqueue_style('wp-a11y-css', sprintf('%s/resources/js/replacements/a11y.css', $this->plugin->getPluginUrl()), [], false);

        // https://github.com/WordPress/WordPress/blob/master/wp-includes/js/plupload/moxie.js unsafe inline style attribute
        if ( isset( $wp_scripts->registered['moxiejs'] ) ) {
            $wp_scripts->registered['moxiejs']->src = sprintf('%s/resources/js/replacements/moxie.js', $this->plugin->getPluginUrl());
        }
    }
}
