//==========================================================
//	POLYFILLS
//==========================================================

//getElementsByClassName polyfill
//Author : Eikes
//URL : https://gist.github.com/eikes/

if ( !document.getElementsByClassName ){
	
	document.getElementsByClassName = function(search) {

		var d = document, elements, pattern, i, results = [];
		if ( d.querySelectorAll ) {// IE8
			return d.querySelectorAll( "." + search );
		}

		if ( d.evaluate ) {

			pattern = ".//*[contains(concat(' ', @class, ' '), ' " + search + " ')]";
			elements = d.evaluate( pattern, d, null, 0, null );
			while ( ( i = elements.iterateNext() ) ) {
				results.push( i );
			}

		} else {

			elements = d.getElementsByTagName( "*" );
			pattern = new RegExp( "(^|\\s)" + search + "(\\s|$)" );
			for (var i = 0; i < elements.length; i++) {
				
				if ( pattern.test( elements[i].className ) ) {
					results.push( elements[i] );
				}

			}

		}

		return results;

	}
}

//==========================================================
//	END POLYFILLS
//==========================================================

(function(w,d){
	//w = window
	//d = document

	//=================================================================
	//
	//=================================================================



	//Defination of the SA-ID-VALIDIFY class/object, properties will be added through the prototype object
	w.SaIdValidae = function( idClassNameIdNumber ) {

		this.__construct( idClassNameIdNumber );

	}
	w.W = function(){this.fruits = "apples";}

	w.SaIdValidae.settings = {
		showCapturedErrors:true,
		showCapturedWarnings:true,
		ignoreWhiteSpace:true,
		messages : {
			invalidLength:"Invalid length",
			invalidDay:"Invalid day",
			invalidMonth:"Invalid Month",
			invalidYear:"Invalid Year",
		},
		considerLeapYear:true,
		year:2016,
		ignoreByCharCode:false
	}

	//lets store reference to the prototype object for easy access
	p = w.SaIdValidae.prototype;

	//Store reference of the window and document object for easy access later
	p.w = w;
	p.d = d;

	//will contain the value of the id number
	p.idNumberObjects = [];

	//will contain all captured errors as strings
	p.errors = [];

	//will contain all captured warnings as strings
	p.warnings = [];

	//will contain a string of charcode or range of charcodes to ignore during validation
	p.ignoreChars = null;//by default numbers and

	//Local settings of instantiated object
	p.settings = {};

	//theoretical exception classes ( just names ), for better presentation of error
	p.exceptionClasses = ["Element Not Found Error :", "Time Not Set Error :"];

	p.setUpIgnoreChars = function( charCodes ) {

		if ( !charCodes )
			return;

		charCodes;

		charCodes = charCodes.replace(/\s+|\]|\[/g,"");
		var individualCharCodes = charCodes.split(":");
		for ( var i = 0; i < individualCharCodes.length; ++i ) {
			
			var rangeValues = individualCharCodes[i].split("-");
			
			if ( !/^\d+$/.test( rangeValues ) ){

				p.ignoreChars = null;
				return false;
			
			}
		}
	}

	p.createLocalSettings = function() {

		this.settings = this.copyFrom( this.w.SaIdValidae.settings );

	}

	p.copyFrom = function( source ){

		var copy = new Object();
		for ( prop  in source ) {

			if ( source[prop] instanceof Object )
				copy[prop] = this.copyFrom( source[prop] );
			else
				copy[prop] = source[prop];
		}
		return copy;
		
	}

	//Define a custom constructor for our class/object
	//RETURNS void
	p.__construct = function( idClassNameIdNumber, ignoreChars ) {

		this.setUpIgnoreChars( ignoreChars );
		this.createLocalSettings();

		var noElementFoundError = "'" + idClassNameIdNumber + "' does not match any element!";

		if ( /^\..*/.test( idClassNameIdNumber ) ){//if className was sent

			var elements = document.getElementsByClassName( idClassNameIdNumber.replace(/^\./,"") );

			for( var i = 0; i < elements.length ; ++i ) {

				this.idNumberObjects.push({ elem:elements[i], value:"" });

			}

			if ( !elements ){

				this.logError( noElementFoundError, 0 );

				return;
			
			} else if ( !elements.length ) {

				this.logError( noElementFoundError, 0 );

				return;

			}

		} else if ( /^#.*/.test( idClassNameIdNumber ) ) {//if id was sent

			var element = document.getElementById( idClassNameIdNumber.replace(/^#/,"") );

			if ( !element ) {

				this.logError( noElementFoundError, 0 );

				return;

			} else {

				this.idNumberObjects.push( { elem:element, value:"" } );

			}

		} else {

			this.idNumberObjects.push({ elem:null,value: idClassNameIdNumber});

		}

		this.setUpIdNumberValues();


		if ( this.settings.considerLeapYear && !this.settings.year )

			this.logWarning( "Requested consideration of Leap Year but did not set Year in settings!", 1 );

	}

	p.validate = function() {
		var results = [];
		for( var i = 0; i < this.idNumberObjects.length; ++i ) {

			var idNumber = this.idNumberObjects[i].value, valid = false, messages = [], gender = null;
			if ( this.ignoreWhiteSpace ){
				idNumber = idNumber.replace(/\s*/g,"");
			}

			if ( idNumber.length != 13 )
				messages.push( this.settings.messages.invalidLength );
			else{

				var y = idNumber.substring(0,2), m = idNumber.substring(2,4), d = idNumber.substring(4,6), g = idNumber.substring(6,7);

				if ( g < 5 )

					gender = "f";

				else

					gender = "m";					

				//validate in order of appearance
				if ( d > 31 || d == 0 ) {

					messages.push( this.settings.messages.invalidDay );

				}

				if ( !( m > 12 || m == 0 ) ) {

					if ( !(d > 31 || d == 0) ){

						if ( !this.isDayInmonth( parseInt( d ), parseInt( m ) ) ) {//note tests for months ending on the 31st will always be true

							messages.push( this.settings.messages.invalidDay );

						}

					}

				} else {

					messages.push( this.settings.messages.invalidMonth );
				}
			}

			if ( !messages.length )

				valid = true;

			results.push( { valid: valid , messages: messages, gender:gender } );
		}

		return results;

	}

	p.isDayInmonth = function( day, month ) {
		var lastDays = [ null , 31, 28, 31, 30, 31, 30, 31 ,31 ,30, 31, 30, 31];//indexes represent months numbers, 1 = January and so on

		if ( lastDays[ month ] < day ){

			if ( month == 2 ) {

				if ( this.settings.considerLeapYear ) {

					if ( /^\d{4}$/.test( this.settings.year + "" ) ) {
						if ( this.settings.year%4 == 0 ) {

							if ( 29 < day )

								return false;

							else

								return true;

						}

					} else {

						this.logWarning( "Leap Year consideration aborted due to invalid year value in settings" );
						this.settings.considerLeapYear = false;

					}

				}

			}

			return false;

		}
			
		return true;
	}

	p.setUpIdNumberValues = function() {

		for( var i = 0; i < this.idNumberObjects.length; ++i ) {

			if (this.idNumberObjects[i].elem){
				if ( !this.idNumberObjects[i].elem.value ){

					this.idNumberObjects[i].value = this.idNumberObjects[i].elem.innerHTML;

				} else {

					this.idNumberObjects[i].value = this.idNumberObjects[i].elem.value;

				}
			}
			
		}

	}

	p.logError = function ( err, whichError ) {

		err = this.exceptionClasses[ whichError ] + err;
		p.errors.push( err );

		if ( this.settings.showCapturedErrors )
			console.error( err );

	}

	p.logWarning = function ( warng ) {

		this.warnings.push( warng );
		if ( this.settings.showCapturedWarnings )
			console.warn( warng );

	}

})(window,document);