# sa-id-validae
Easy to use South African ID validator. It validates from any HTML element capable of containing text and returns an object with easy to use information

#Usage
```javascript
  //new SaIdValidae( idenifier/id number [, charactersToIgnore] );
 
  //returns an object with list of matching elements ( have className: id-number-family )
  var validationObjects = new SaIdValidae( ".id-number-family" );
  //or
  //returns an object with matched element ( have id: id-number-1 )
  var validationObjects = new SaIdValidae( "#id-number-1" );
  
  //You can specify which characters to ignore for id numbers with masks for example, like : 999999-9999-999 , ignore dashes or maybe
  //the id number just happens to be within a mess, like 9+_)9999!9-99()99-&&999
  //syntax for specifying characters to ignore is :
  //                                            [ 45 ] "For one character, in this case a dash - "
  //                                            [ 45 ] : [ 97 ] "Separate by colon for two or more, i.e ignore dash and alphabet 'a'"
  //                                            [ 97 - 122 ] "Specify ranges for grouped characters, ignores all lowercase alphabets"
  
  var validationObjects = new SaIdValidae( ".id-number-family" , "[ 40 - 42 ] : [ 45 ]" );
  
  //returns an array, always returns an array ( note the name validae :) ), with objects containing validation information, along with the html elements the tests took place on
  //The returned array will always containe one element if an id was used to get matching objects
```
##validation
```javascript
  var results = validationObjects.validate();
  //or
  //validate id number that's not in html element
  var validation = new SaIdValidae("xxxxxxxxxxxxx").validate();
  /*  [
        {
          valid : true,
          messages : [], ---empty array if id number is valid
          gender : "f":, ---female
          citizen : "SA-Citizen",
          elem : [object HTMLInputElement],
          dd : 12,
          mm : 08,
          yy : 94,
          yyyy : 1994,
          mmmm : August
        }
      ]
  */
```
##Settings Object
```javascript
  //The values are he actual defaults
  //Note that every instantiated object makes a copy of these and can then have its own settings changed locally
  SaIdValidaeSettings = {
		showCapturedErrors:true,//show captured errors in console
		showCapturedWarnings:true,//show captured warnings in console
		ignoreWhiteSpace:true,//ignore white spaces in the id number
		messages : {
			invalidCharacters:"Invalid characters in id number",
			invalidLength:"Invalid length",
			invalidDay:"Invalid day",
			invalidMonth:"Invalid Month",
			invalidYear:"Invalid Year",
			invalidCitizenNumber:"Invalid Citizen Number",
			invalidSecondLastDigit:"Invalid second last digit"
		},
		considerLeapYear:false,
		year:null,
		secondLastDigitAcceptables:[8,9],
		forgetThe1900s:false,
		dontForgetThese1900s:[]
	}
```

##Consider Leap Year on validation
```javascript
  //If considerLeapYear is true, any id number with month February and day 29 on any year not divisible by 4 (leap year) will be considered invalid
  SaIdValidaeSettings.considerLeapYear = true;
  //this will require that you set current year as well, year on local computer not reliable
  SaIdValidaeSettings.year = 2016;
  
  //or set settings on instantiated object. Note this does not affect 'SaIdValidaeSettings' properties
  validationObjects.considerLeapYear = true;
  validationObjects.year = true;
```

##2006 or 1906? :\
```javascript
  //If forgetThe19s is true, any 1900s year whose last two digits match the last two digits of any 2000s year we've reached (theoretically) will be ignored
  //e.g 06 = 2006 instead of 1906
  SaIdValidaeSettings.forgetThe1900s = true;
  
  //note SaIdValidaeSettings.year will be used to check current yeah and thus must be set
  SaIdValidaeSettings.year = 2016;
  
  //or again, locally
  validationObjects.year = true;
  
  //If there are years you do not want ignored
  //May be useful for ignoring id numbers of 5 year olds
  SaIdValidaeSettings.dontForgetThese1900s = [5,11,17];//Years will be seen as 1905, 1911, 1917 instead of 2005, 2011 and 2017
```

##Second Last Digit (The 8)?
```javascript

//by default 8 and 9 are accepted, you can add additional ones or maybe even eliminate the 9
SaIdValidaeSettings.secondLastDigitAcceptables = [ 8, 9, 0 ];

//or use the best Array function
SaIdValidaeSettings.secondLastDigitAcceptables.push( 0 );

```
