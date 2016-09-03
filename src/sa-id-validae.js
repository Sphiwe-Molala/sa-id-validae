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
	w.SaIdValidae = function( idClassNameIdNumber , ignoreChars ) {

		//will contain the value of the id number
		this.idNumberObjects = [];

		//will contain all captured errors as strings
		this.errors = [];

		//will contain all captured warnings as strings
		this.warnings = [];

		//will contain a string of charcode or range of charcodes to ignore during validation
		this.ignoreChars = null;//by default numbers and

		//Local settings of instantiated object
		this.settings = {};

		//theoretical exception classes ( just names ), for better presentation of error
		this.exceptionClasses = ["Element Not Found Error :", "Time Not Set Error :"];

		this.setUpIgnoreChars = function( charCodes ) {

			if ( !charCodes )
				return;

			charCodes;

			charCodes = charCodes.replace(/\s+|\]|\[/g,"");
			var individualCharCodes = charCodes.split(":");
			this.ignoreChars = [];

			for ( var i = 0; i < individualCharCodes.length; ++i ) {
				
				var invalid = false;
				var rangeValues = individualCharCodes[i].split("-");
				this.ignoreChars.push( rangeValues );

				if (  rangeValues.length > 2 ){

					invalid = true;
				
				} else {

					if ( !/^\d+$/.test( rangeValues[0] ) ) {
						
						invalid = true;

					}

					if ( 2 == rangeValues.length ) {

						if ( !/^\d+$/.test( rangeValues[1] ) ) {

							invalid = true;

						} else if ( !invalid ) {

							if ( rangeValues[0] > rangeValues[1] ) {

								invalid = true;

							}

						}

					}

				}

				console.log( this.ignoreChars );

				if ( invalid ) {

					this.ignoreChars = null;
					return false;
				}
			}
		}

		this.escapeIfRegExpChar = function( regChar ) {

			var regChars = ["]","[","^","$",".","|","?","*","+","(",")","{","}"];

			for ( var i = 0; i < regChars.length; ++i ) {

				if ( regChars[i] == regChar ) {

					return "\\" + regChar;

				}

			}

			return regChar;
			
		}

		this.removeIgnoreChars = function( idNumber ) {


			if ( !this.ignoreChars ) {

				return idNumber;

			}

			for ( var i = 0; i < this.ignoreChars.length; ++i ) {

				if ( this.ignoreChars[i].length == 2 ) {

					for ( var r = this.ignoreChars[i][0] ; r <= this.ignoreChars[i][1] ; ++r ) {
						
						idNumber = idNumber.replace( new RegExp( ( r == 92 ? "\\" : this.escapeIfRegExpChar( String.fromCharCode( r ) ) ), "g" ), "" );
					
					}

				} else {
					
					idNumber = idNumber.replace( new RegExp( ( r == 92 ? "\\" : this.escapeIfRegExpChar( String.fromCharCode( this.ignoreChars[i][0] ) ) ) , "g"), "" );

				}

			}

			return idNumber;

		}
		this.createLocalSettings = function() {

			this.settings = this.copyFrom( this.w.SaIdValidae.settings );

		}

		this.copyFrom = function( source, excludeFunctions ){

			var copy = new Object();
			for ( prop  in source ) {

				if ( excludeFunctions ) {

					if ( typeof source[prop] == 'function' )

						continue;

				}

				if ( source[prop] instanceof Array ){

					var array = source[prop];
					for ( var i = 0; i < array.length; ++i ) {

						if ( array[i] instanceof Object ) {

							array[i] = this.copyFrom( array[i] );

						}

					}

					copy[prop] = [].concat( array );

				}
				else if ( source[prop] instanceof Object )
					copy[prop] = this.copyFrom( source[prop] );
				else
					copy[prop] = source[prop];
			}
			return copy;

		}

		//Define a custom constructor for our class/object
		//RETURNS void
		this.__construct = function( idClassNameIdNumber, ignoreChars ) {

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

			//console.log( this.idNumberObjects )

		}

		this.validate = function() {
			var results = [];



			if ( !this.settings.secondLastDigitAcceptables instanceof Array ){

				this.logWarning( "Customly defined secondLastDigitAcceptables value will be ignored since not Array");
				this.settings.secondLastDigitAcceptables = [ 8 , 9 ];

			}

			for( var i = 0; i < this.idNumberObjects.length; ++i ) {

				var idNumber = this.idNumberObjects[i].value, valid = false, messages = [], gender = null,citizen=null;
				if ( this.settings.ignoreWhiteSpace ){
					idNumber = idNumber.replace(/\s*/g,"");
				}
				
				idNumber = this.removeIgnoreChars( idNumber );
				

				if ( idNumber.length != 13 )

					messages.push( this.settings.messages.invalidLength );
				
				else if ( !/^\d+$/.test( idNumber ) ) {

					messages.push( this.settings.messages.invalidCharacters );

				} else{

					var y = idNumber.substring(0,2), m = idNumber.substring(2,4), d = idNumber.substring(4,6), g = idNumber.substring(6,7), c = idNumber.substring(10,11), the8 = idNumber.substring(11,12);

					if ( g < 5 )

						gender = "f";

					else

						gender = "m";					


					if (  c == 1 )

						citizen = "SA Citizen";

					else if ( c == 0 )

						citizen = "Non-SA Citizen";

					else {

						messages.push( this.settings.messages.invalidCitizenNumber );

					}

					var the8IsOk = false;
					for ( var z = 0; z < this.settings.secondLastDigitAcceptables.length; ++z ) {
						
						if ( this.settings.secondLastDigitAcceptables[z] == the8 ){

							the8IsOk = true;
							break;
						
						}	

					}

					if ( !the8IsOk ) {

						messages.push( this.settings.messages.invalid8 );

					}

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

				results.push( { valid: valid , messages: messages, gender:gender, citizen:citizen } );
			}

			return results;

		}

		this.isDayInmonth = function( day, month ) {
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

		this.setUpIdNumberValues = function() {

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

		this.logError = function ( err, whichError ) {

			err = this.exceptionClasses[ whichError ] + err;
			p.errors.push( err );

			if ( this.settings.showCapturedErrors )
				console.error( err );

		}

		this.logWarning = function ( warng ) {

			this.warnings.push( warng );
			if ( this.settings.showCapturedWarnings )
				console.warn( warng );

		}

		this.__construct( idClassNameIdNumber , ignoreChars );

	}

	w.SaIdValidae.settings = {
		showCapturedErrors:true,
		showCapturedWarnings:true,
		ignoreWhiteSpace:true,
		messages : {
			invalidCharacters:"Invalid characters in id number",
			invalidLength:"Invalid length",
			invalidDay:"Invalid day",
			invalidMonth:"Invalid Month",
			invalidYear:"Invalid Year",
			invalidCitizenNumber:"Invalid Citizen Number",
			invalid8:"Invalid 8"
		},
		considerLeapYear:false,
		year:null,
		ignoreByCharCode:false,
		secondLastDigitAcceptables:[8,9]
	}

	//lets store reference to the prototype object for easy access
	p = w.SaIdValidae.prototype;
	//Store reference of the window and document object for easy access later
	w.SaIdValidae.prototype.w = w;
	w.SaIdValidae.prototype.d = d;

	w.SaIdValidae.repeatString = function( string, factor ) {

		if ( !string )

			string = "";

		if ( factor < 1 ){

			p.logError( "repeatString( string, factor ) expects integer factor of 1 or greater" );
			return string;
	
		}

		var newString = "";

		for ( var e = 0;e < factor; ++e ) {

			newString += string;

		}

		return newString;

	}

	w.SaIdValidae.toHTMLString = function( object, withoutDelimeters, objectLevel ) {

		return SaIdValidae.__toString( object, withoutDelimeters, objectLevel ).replace(/\n/g,"<br>").replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;");

	}

	w.SaIdValidae.__toString = function( object, withoutDelimeters , objectLevel ) {

		if ( !object ){

			return "";

		}

		if ( object == window || object == document ) {

			return "{" + object.toString() + "}";

		}

		if ( window.HTMLElement !== undefined ){

			if ( object instanceof HTMLElement ) {

				return "{" + object.toString() + "}";

			}

		} else {

				if ( (typeof obj==="object") && (obj.nodeType===1) && (typeof obj.style === "object") && (typeof obj.ownerDocument ==="object") )

					return "{" + object.toString() + "}";

		}

		if ( !objectLevel )

			objectLevel = 1;

		var string = "";

		var indentation = SaIdValidae.repeatString( "\t", objectLevel );//indentation for 'object'

		var innerIndentation = indentation + "\t";//indentation for properties of 'object'

		var openingDelimeter = "{", closingDelimeter = "}", propValueSeparator = " : ", class_ = "Object ";//Delimeters and className

		if ( object instanceof Array ){

			openingDelimeter = "["; closingDelimeter = "]"; propValueSeparator = " => "; class_ = "Array ";//Delimeters and className

		}

		if ( withoutDelimeters ) {

			openingDelimeter = ""; closingDelimeter = ""; class_ = "";

		}

		string = ( objectLevel == 1 ? "\n" + indentation : "" ) + ( object instanceof Array ? "" :  class_  ) + openingDelimeter;
		
		for ( prop in object ) {

			if ( typeof object[ prop ] == "function" ){

				string += "\n" + innerIndentation + prop  + propValueSeparator + "function() { [Some-Code] }";

			} else if ( object[ prop ] instanceof Object ){
						
				string += "\n" + innerIndentation + prop + propValueSeparator + SaIdValidae.__toString( object[ prop ], withoutDelimeters, ( objectLevel + 1 ) );		
			
			}  else {

				string += "\n" + innerIndentation + prop + propValueSeparator + object[ prop ];

			}

		}

		if ( closingDelimeter.length )
			string += "\n" + indentation + closingDelimeter;

		return string;

	}

})(window,document);