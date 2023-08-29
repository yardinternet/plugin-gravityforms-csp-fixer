<?php

namespace Yard\CSP\GravityForms;

class GravityFormsFixer
{
    public function generateUniqueEventListenerName(): string
    {
        // Generate a unique name using a combination of timestamp and random number
        return 'eventListener_' . time() . '_' . mt_rand(1000, 9999);
    }

    public function handleOnclickAttributes(string $formString): string
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

    public function modifyFormHtml(string $formString, array $form): string
    {
        $formString = $this->handleOnclickAttributes($formString);
        $formString = $this->handleStyleAttribute($formString, $form);

        return $formString;
    }
}
