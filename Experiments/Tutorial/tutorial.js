

// Declaring global variables
var nameOfFunction,
	functionString;

// Using jquery to load javascript after document is ready/loaded.
$(function() {
	// constructor like
	function object(var1, var2, var3) {

		this.var1 = var1;
		this.var2 = var2;
		this.var3 = var3;
	}

	// create new object
	var obj = new object("one", "two", "three");

	// add property to object
	object.prototype.var4 = "flour";

	// Assign new value to property
	obj.var4 = "four";


	// Insert stuff using pure javascript
	var ele = document.getElementById("testelement1");

	ele.innerHTML = obj.var1;

	
	// insert stuff using jquery
	$("#testelement2").html(obj.var2);


	// write to console.
	console.log(obj.var3);

	// Parsing string to function

	if (1 > 2) {
		functionString = "nameOfFunction";
	} else {
		functionString ="potato";
	}

	window[functionString]("test");

});


nameOfFunction = function (myVar) {
	alert(myVar);
};

potato = function (arg) {
	console.log(arg);
}