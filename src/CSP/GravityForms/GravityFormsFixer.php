<?php

namespace Yard\CSP\GravityForms;

class GravityFormsFixer
{
    public function generateUniqueEventListenerName(): string
    {
        return 'eventListener_' . wp_unique_id();
    }

    public function handleOnClickAttributes(string $formString): string
    {
        $pattern = '/\sonclick\s*=\s*([\'"])((?>\\\\\1|[^\1])*?)\1/m';
        $scriptTags = [];
    
        $formString = preg_replace_callback(
            $pattern,
            function (array $matches) use (&$scriptTags): string {
                $uniqueListenerName = $this->generateUniqueEventListenerName();
    
                $onclickCode = html_entity_decode($matches[2]);
                $scriptTag = '<script id="' . $uniqueListenerName . '">
                    document.querySelector("[data-onclick-handler=' . $uniqueListenerName . ']").addEventListener("click", function() {
                        ' . $onclickCode . '
                    });
                    </script>';
    
                $scriptTags[] = $scriptTag;
    
                return ' data-onclick-handler="' . $uniqueListenerName . '"';
            },
            $formString
        );
    
        // Append all the script tags to the modified $formString
        return $formString . implode('', $scriptTags);
    }

    public function handleOnKeyPressAttributes(string $formString): string
    {
        $pattern = '/\sonkeypress\s*=\s*([\'"])((?>\\\\\1|[^\1])*?)\1/m';
        $scriptTags = [];
    
        $formString = preg_replace_callback(
            $pattern,
            function (array $matches) use (&$scriptTags): string {
                $uniqueListenerName = $this->generateUniqueEventListenerName();
    
                $onclickCode = html_entity_decode($matches[2]);
                $scriptTag = '<script id="' . $uniqueListenerName . '">
                    document.querySelector("[data-onkeypress-handler=' . $uniqueListenerName . ']").addEventListener("keypress", function() {
                        ' . $onclickCode . '
                    });
                    </script>';
    
                $scriptTags[] = $scriptTag;
    
                return ' data-onkeypress-handler="' . $uniqueListenerName . '"';
            },
            $formString
        );
    
        // Append all the script tags to the modified $formString
        return $formString . implode('', $scriptTags);
    }

    public function handleStyleAttribute(string $formString, array $form): string
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

    public function handleInlineJavaScriptVoid(string $formString): string
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
        $formString = $this->handleOnClickAttributes($formString);
        $formString = $this->handleOnKeyPressAttributes($formString);
        $formString = $this->handleStyleAttribute($formString, $form);
        $formString = $this->handleInlineJavaScriptVoid($formString);

        return $formString;
    }
}
