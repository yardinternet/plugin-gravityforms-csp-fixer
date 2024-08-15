jQuery( document ).on(
	'gform_post_render',
	function ( event, form_id, current_page ) {
		//TODO: betere scope
		var elements = jQuery( document ).find( '[data-style]' );
		elements.each( function () {
			var styles = jQuery( this ).data( 'style' );
			jQuery( this ).css( styles );
			jQuery( this ).removeAttr( 'data-style' );
		} );
	}
);

//Add event handlers for the delete button of uploaded files
jQuery(document).on('gform_post_render', function () {
	gform.addFilter(
		'gform_file_upload_markup',
		function ( html, file, up, strings, imagesUrl, response ) {
			const regexp = /\son([a-z]*)\s*=\s*([\'"])((>\\\\\2|[^\2])*?)\2/g;
			const formId = up.settings.multipart_params.form_id;
			const fieldId = up.settings.multipart_params.field_id;

			const eventHandlers = [ ...html.matchAll( regexp ) ];
			eventHandlers.forEach( function ( e ) {
				const eventType = e[ 1 ];
				up.bind( 'UploadComplete', function () {
					document
						.querySelector(
							'[data-on' +
								eventType +
								'-handler=upload' +
								eventType +
								'handler_' +
								formId +
								'_' +
								fieldId +
								']'
						)
						.addEventListener( eventType, function () {
							gformDeleteUploadedFile( formId, fieldId, this );
						} );
				} );
			} );

			html = html.replaceAll(
				regexp,
				' data-on$1-handler="upload$1handler_' + formId + '_' + fieldId + '"'
			);

			return html;
		}
	);
});