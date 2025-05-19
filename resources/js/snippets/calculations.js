import { Parser } from 'expr-eval';

/**
 * Monkey patch the GFCalc class to override the runCalc method.
 * This is necessary to prevent the use of eval() in the calculation engine.
 */
window.gform.initializeOnLoaded( function () {
	// Preserve the original constructor
	const OriginalGFCalc = window.GFCalc;

	// Create the patched constructor
	window.GFCalc = function ( formId, formulaFields ) {
		const instance = new OriginalGFCalc( formId, formulaFields ); // Call the original constructor

		// Override the runCalc method
		instance.runCalc = function ( formulaField, formId ) {
			let calcObj = this,
				field = jQuery(
					'#field_' + formId + '_' + formulaField.field_id
				),
				formulaInput = field.hasClass( 'gfield_price' )
					? jQuery(
							'#ginput_base_price_' +
								formId +
								'_' +
								formulaField.field_id
					  )
					: jQuery(
							'#input_' + formId + '_' + formulaField.field_id
					  ),
				previous_val = formulaInput.val(),
				formula = gform.applyFilters(
					'gform_calculation_formula',
					formulaField.formula,
					formulaField,
					formId,
					calcObj
				),
				expr = calcObj
					.replaceFieldTags( formId, formula, formulaField )
					.replace( /(\r\n|\n|\r)/gm, '' ),
				result = '';

			// Start of monkey patch eval()
			if ( this.exprPatt.test( expr ) ) {
				try {
					result = Parser.parse( expr ).evaluate( this.values );
				} catch ( e ) {}
			} else {
				return;
			}
			// End of monkey patch eval()

			if ( ! isFinite( result ) ) result = 0;

			if ( window.gform_calculation_result ) {
				result = window.gform_calculation_result(
					result,
					formulaField,
					formId,
					calcObj
				);
				if ( window.console )
					console.log(
						'"gform_calculation_result" function is deprecated since version 1.8! Use "gform_calculation_result" JS hook instead.'
					);
			}

			result = gform.applyFilters(
				'gform_calculation_result',
				result,
				formulaField,
				formId,
				calcObj
			);

			const formattedResult = gform.applyFilters(
				'gform_calculation_format_result',
				false,
				result,
				formulaField,
				formId,
				calcObj
			);

			const numberFormat = gf_get_field_number_format(
				formulaField.field_id,
				formId
			);

			if ( formattedResult !== false ) {
				result = formattedResult;
			} else if (
				field.hasClass( 'gfield_price' ) ||
				numberFormat == 'currency'
			) {
				result = gformFormatMoney( result ? result : 0, true );
			} else {
				let decimalSeparator = '.';
				let thousandSeparator = ',';

				if ( numberFormat == 'decimal_comma' ) {
					decimalSeparator = ',';
					thousandSeparator = '.';
				}

				result = gformFormatNumber(
					result,
					! gform.utils.isNumber( formulaField.rounding )
						? -1
						: formulaField.rounding,
					decimalSeparator,
					thousandSeparator
				);
			}

			if ( result === previous_val ) return;

			if ( field.hasClass( 'gfield_price' ) ) {
				jQuery( '#input_' + formId + '_' + formulaField.field_id ).text(
					result
				);

				formulaInput.val( result ).trigger( 'change' );

				if ( formulaInput && formulaInput.length > 0 ) {
					window.gform.utils.trigger( {
						event: 'change',
						el: formulaInput[ 0 ],
						native: true,
					} );
				}

				if (
					jQuery( '.gfield_label_product' ).length &&
					! jQuery( '.ginput_total' ).length
				) {
					result =
						jQuery(
							'label[ for=input_' +
								formId +
								'_' +
								formulaField.field_id +
								'_1 ]'
						)
							.find( '.gfield_label_product' )
							.text() +
						' ' +
						result;
					wp.a11y.speak( result );
				}
			} else {
				formulaInput.val( result ).trigger( 'change' );
			}
		};

		return instance;
	};
} );
