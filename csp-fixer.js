jQuery(document).on('gform_post_render', function(event, form_id, current_page){
    //TODO: betere scope
    var elements = jQuery(document).find("[data-style]");
    elements.each(function(){
        var styles = jQuery( this ).data('style');
        jQuery(this).css(styles);
        jQuery(this).removeAttr('data-style');
    });
});
