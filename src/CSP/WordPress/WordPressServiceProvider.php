<?php

namespace Yard\CSP\WordPress;

use Yard\CSP\Foundation\ServiceProvider;

class WordPressServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->plugin->loader->addAction('wp_enqueue_scripts', $this, 'enqueueReplacementScripts', 10, 0);
        $this->plugin->loader->addFilter('render_block', $this, 'moveInlineStyles', 10, 2);
    }

    public function enqueueReplacementScripts(): void
    {
        $wpScripts = wp_scripts();

        // https://github.com/WordPress/WordPress/blob/master/wp-includes/js/dist/a11y.js unsafe inline style attribute
        if (isset($wpScripts->registered['wp-a11y'])) {
            $wpScripts->registered['wp-a11y']->src = sprintf('%s/resources/js/replacements/a11y.js', $this->plugin->getPluginUrl());
        }
        wp_enqueue_style('wp-a11y-css', sprintf('%s/resources/js/replacements/a11y.css', $this->plugin->getPluginUrl()), [], false);

        // https://github.com/WordPress/WordPress/blob/master/wp-includes/js/plupload/moxie.js unsafe inline style attribute
        if (isset($wpScripts->registered['moxiejs'])) {
            $wpScripts->registered['moxiejs']->src = sprintf('%s/resources/js/replacements/moxie.js', $this->plugin->getPluginUrl());
        }
    }

    public function moveInlineStyles(string $blockContent, array $block): string
    {
        $htmlProcessor = \WP_HTML_Processor::create_fragment($blockContent);
        $cssRules = [];
        $excludeFromCssRules = [
            'yard-blocks/iconlist-item',
        ];
        $shouldExcludeFromCss = in_array($block['blockName'], $excludeFromCssRules, true);

        while ($htmlProcessor->next_tag()) {
            $styleAttribute = $htmlProcessor->get_attribute('style');
            if (! $styleAttribute) {
                continue;
            }

            $rules = array_filter(explode(';', $styleAttribute));
            $declarations = [];
            foreach ($rules as $rule) {
                $ruleElements = explode(':', $rule, 2);
                if (empty($ruleElements[1])) {
                    continue;
                }
                $declarations[trim($ruleElements[0])] = trim($ruleElements[1]) . ' !important';
            }

            if (! empty($declarations) && ! $shouldExcludeFromCss) {
                $cspClass = wp_unique_prefixed_id('yard-csp-fixer-block-');
                $classes = iterator_to_array($htmlProcessor->class_list());
                $classes[] = $cspClass;

                $selector = sprintf(
                    '%s.%s',
                    strtolower(implode(' ', $htmlProcessor->get_breadcrumbs())),
                    implode('.', $classes),
                );
                $cssRules[] = [
                    'selector' => $selector,
                    'declarations' => $declarations,
                ];

                $htmlProcessor->add_class($cspClass);
            }
            $htmlProcessor->remove_attribute('style');
        }

        if (! empty($cssRules) && ! $shouldExcludeFromCss) {
            wp_register_style('yard-csp-fixer', false);
            wp_enqueue_style('yard-csp-fixer');
            wp_add_inline_style(
                'yard-csp-fixer',
                wp_style_engine_get_stylesheet_from_css_rules($cssRules)
            );
        }

        return $htmlProcessor->get_updated_html();
    }
}
