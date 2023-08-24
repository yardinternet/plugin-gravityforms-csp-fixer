<?php
/**
 * CSP Fixer
 * 
 * Plugin Name:       CSP Fixer
 * Description:       Fixes
 * Version:           0.0.1
 * Requires at least: 5.9
 * Requires PHP:      7.4
 * Author:            Maarten
 * Author URI:        https://www.yard.nl
 */

defined('ABSPATH') || die();


add_action( 'gform_enqueue_scripts', 
function () {
    wp_enqueue_script( 'csp-fixer', plugin_dir_url(__FILE__) . '/csp-fixer.js', ['jquery'], random_int(1,100000) );
}, 10, 2);

add_filter( 'gform_get_form_filter', function ( string $form_string, array $form ): string {
    $pattern = '/\sstyle\s*=\s*([\'"])((?>\\\\\1|[^\1])*?)\1/m';

    $form_string = preg_replace_callback(
        $pattern,
        function(array $matches): string {
            $style_array = [];
            $rules = array_filter( explode( ';', trim( $matches[2] ) ) );
            foreach ($rules as $rule ){
                $rule_elements = explode( ':', $rule );
                $style_array[trim($rule_elements[0])] = trim($rule_elements[1]);
            }
            return " data-style = '" . wp_json_encode($style_array) . "'";
        },
        $form_string
    );

    return $form_string;
}, 10, 2);


return;


add_filter( 'gform_progress_bar', function ( string $progress_bar, array $form, string $confirmation_message ): string {
    $processor = new \WP_HTML_Tag_Processor( $progress_bar );
 
     $query = [
        'tag_name' => 'div',
        'class_name' => 'gf_progressbar_percentage'
    ];

    if ( $processor->next_tag( $query ) ) {
        $processor = csp_fixer_move_styles($processor);
    }

    return $processor->get_updated_html();
},10, 3);


add_filter( 'gform_get_form_filter', function ( string $form_string, array $form ): string {
    
    $processor = new \WP_HTML_Tag_Processor( $form_string );

    if ($processor->next_tag(['class_name' => 'gform_wrapper'])) {
        $processor = csp_fixer_move_styles($processor);
    }

    while ($processor->next_tag(['class_name' => 'gform_page'])) {
        $processor = csp_fixer_move_styles($processor);
    }

    return $processor->get_updated_html();
}, 10, 2 );


add_filter( 'gform_get_form_filter', function ( string $form_string, array $form ): string {
    $processor = new \WP_HTML_Tag_Processor($form_string );
    if ($processor->next_tag('iframe')) {
        $processor = csp_fixer_move_styles($processor);
    }
    return $processor->get_updated_html();
}, 10, 2 );

add_filter('gform_field_content', function( string $field_content, \GF_Field $field, $value, int $entry_id, int $form_id ): string {
    $processor = new \WP_HTML_Tag_Processor($field_content );

    $query = [
        'tag_name' => 'button',
        'class_name' => 'delete_list_item'
    ];

    if ($processor->next_tag($query)) {
        $processor = csp_fixer_move_styles($processor);
    }
    return $processor->get_updated_html();
}, 10, 5);

function csp_fixer_move_styles( \WP_HTML_Tag_Processor $processor ): \WP_HTML_Tag_Processor {
    $style = $processor->get_attribute('style');

    if ( empty( $style )) {
        return $processor;
    }

    
    $style_array = [];
    $rules = array_filter( explode( ';', trim( $style ) ) );
    foreach ($rules as $rule ){
        $rule_elements = explode( ':', $rule );
        $style_array[trim($rule_elements[0])] = trim($rule_elements[1]);
    }

    $processor->remove_attribute( 'style');
    $processor->set_attribute( 'data-style', wp_json_encode($style_array));
    return $processor;
}





