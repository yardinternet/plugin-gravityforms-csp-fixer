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
        $this->plugin->loader->addAction('admin_enqueue_scripts', $this, 'disableMultiFileUpload', 11, 0);
    }

    public function enqueueFixerScript(): void
    {
        wp_enqueue_script('csp-fixer', sprintf('%s/resources/js/csp-fixer.js', $this->plugin->getPluginUrl()), ['jquery'], $this->plugin->getVersion());
    }

    public function disableMultiFileUpload()
    {
        $inlineScript = "
            gform.addFilter( 'gform_editor_field_settings', function( settings, field ) {
                if ( field.type !== 'fileupload' ) {
                    return settings;
                }
                return settings.filter((setting) => setting !== '.multiple_files_setting');
            } );";

        wp_add_inline_script(
            'gform_form_admin',
            $inlineScript,
            'before'
        );
    }
}
