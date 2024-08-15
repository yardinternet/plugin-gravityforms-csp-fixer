<?php

namespace Yard\CSP\GravityForms;

class GravityFormsFixer
{
    private function handleInlineEvents(string $formString): string
    {
        $pattern = '/\son([a-z]*)\s*=\s*([\'"])((?>\\\\\2|[^\2])*?)\2/m';
        $scriptTags = [];

        $formString = preg_replace_callback(
            $pattern,
            function (array $matches) use (&$scriptTags): string {
                $uniqueListenerName = wp_unique_id('eventListener_');
                $event = $matches[1];
                $scriptTags[] = wp_get_inline_script_tag(
                    sprintf(
                        'document.querySelector("[data-on%2$s-handler=%1$s]").addEventListener("%2$s", function() {%3$s});',
                        $uniqueListenerName,
                        $event,
                        html_entity_decode($matches[3])
                    ),
                    [
                        'id' => $uniqueListenerName
                    ]
                );

                return sprintf(' data-on%s-handler="%s"', $event, $uniqueListenerName);
            },
            $formString
        );

        // Append all the script tags to the modified $formString
        return $formString . implode('', $scriptTags);
    }

    private function handleStyleAttribute(string $formString, array $form): string
    {
        $pattern = '/\sstyle\s*=\s*([\'"])((?>\\\\\1|[^\1])*?)\1/m';

        return preg_replace_callback(
            $pattern,
            function (array $matches): string {
                $styleArray = [];
                $rules = array_filter(explode(';', trim($matches[2])));

                foreach ($rules as $rule) {
                    $ruleElements = explode(':', $rule);
                    $styleArray[trim($ruleElements[0])] = trim($ruleElements[1]);
                }

                return " data-style = '" . \wp_json_encode($styleArray) . "'";
            },
            $formString
        );
    }

    private function handleInlineJavaScriptVoid(string $formString): string
    {
        $pattern = '/href\s*=\s*([\'"])javascript:void\(0\);\1/m';

        return preg_replace_callback(
            $pattern,
            function (): string {
                return ' href="#"';
            },
            $formString
        );
    }

    public function modifyFormHtml(string $formString, array $form): string
    {
        $formString = $this->handleInlineEvents($formString);
        $formString = $this->handleStyleAttribute($formString, $form);
        $formString = $this->handleInlineJavaScriptVoid($formString);

        return $formString;
    }
}
