<?php

namespace Yard\CSP\GravityForms;

use Yard\CSP\Foundation\ServiceProvider;

class GravityFormsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $gravityFormsFixer = new GravityFormsFixer();

        $this->plugin->loader->addFilter('gform_get_form_filter', $gravityFormsFixer, 'modifyFormHtml', 10, 2);
        $this->plugin->loader->addAction('gform_enqueue_scripts', $this, 'enqueueFixerScript', 10, 0);
    }

    public function enqueueFixerScript(): void
    {
        wp_enqueue_script('csp-fixer', sprintf('%s/public/build/gravityforms-csp-fixer.js', $this->plugin->getPluginUrl()), ['jquery'], $this->plugin->getVersion());
    }
}
