<?php

namespace Yard\CSP\GravityForms;

class GravityFormsFixer
{
    private function handleInlineEvents(string $formString): string
	{
		$pattern = '/\son([a-z]*)\s*=\s*([\'"])((?>\\\\\2|[^\2])*?)\2/m';
		$scriptTags = [];
		$scriptIds = [];

		$formString = preg_replace_callback(
			$pattern,
			function (array $matches) use (&$scriptTags, &$scriptIds): string {
				$event = $matches[1];
				$handlerCode = html_entity_decode($matches[3]);
				$scriptId = 'eventListener_' . $event . '_' . substr(md5($handlerCode), 0, 10);

				// Don't add duplicate scripts (elements with same handler code)
				if (in_array($scriptId, $scriptIds, true)) {
					return sprintf(' data-on%s-handler="%s"', $event, $scriptId);
				}

                /**
                 * Add event listener to document which handles event delegation
                 * in case of multiple elements sharing same event listener
                 * (e.g. gravity forms list field add/remove button)
                 * .call() is used to delegate proper "this" keyword to original event handler
                 */
				$scriptIds[] = $scriptId;
				$scriptTags[] = wp_get_inline_script_tag(
					sprintf(
						'document.addEventListener("%2$s", function(e) {
							const parent = e.target.closest("[data-on%2$s-handler=%1$s]");

							if (parent) {
								(function(element){ %3$s })(parent);
							}
						});',
						$scriptId,
						$event,
						str_replace('this', 'element', $handlerCode)
					),
					[
						'id' => $scriptId,
					]
				);

				return sprintf(' data-on%s-handler="%s"', $event, $scriptId);
			},
			$formString
		);

		if ([] !== $scriptTags) {
			$formClosePosition = strpos($formString, '</form>');

			// Add scripts before closing form tag. Appending to the end of the form HTML doesn't work with AJAX.
			if (false !== $formClosePosition) {
				return substr($formString, 0, $formClosePosition) . implode('', $scriptTags) . substr($formString, $formClosePosition);
			}
		}

		return $formString;
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

    /**
     * Gravity Forms and its add-ons may emit raw <script>, bypassing any CSP nonce.
     * Run wp_inline_script_attributes filter so inline tags get nonces.
     */
    private function handleInlineScriptTags(string $html): string
    {
        $processor = new \WP_HTML_Tag_Processor($html);

        while ($processor->next_tag('SCRIPT')) {
            // External scripts are covered by the source list, not by a nonce.
            if (null !== $processor->get_attribute('src') || null !== $processor->get_attribute('nonce')) {
                continue;
            }

            $attributes = apply_filters('wp_inline_script_attributes', [], $processor->get_modifiable_text());

            foreach ($attributes as $name => $value) {
                // Never overwrite an attribute the script set itself.
                if (null !== $processor->get_attribute($name)) {
                    continue;
                }

                $processor->set_attribute($name, $value ?? true);
            }
        }

        return $processor->get_updated_html();
    }

    public function modifyFormHtml(string $formString, array $form): string
    {
        $formString = $this->handleInlineEvents($formString);
        $formString = $this->handleStyleAttribute($formString, $form);
        $formString = $this->handleInlineJavaScriptVoid($formString);
        $formString = $this->handleInlineScriptTags($formString);

        return $formString;
    }

    /**
     * @param string|array $confirmation
     *
     * @return string|array
     */
    public function modifyConfirmationHtml($confirmation)
    {
        // An array confirmation is a redirect (['redirect' => $url]) and holds no markup.
        if (! is_string($confirmation)) {
            return $confirmation;
        }

        return $this->handleInlineScriptTags($confirmation);
    }
}
