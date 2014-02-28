
/*

STORED ONLY FOR FUTURE REFERANCE? OR? OR?

$(document).ready(function() {  

	var nav = new Navigation();

	// Select action for elements within the .tab class.
	$('.menutab').mouseover(function() {

		nav.changeClass(this, 'hovered');

	});

	// Deselect on hover
	$('#options_container').mouseover(function(e) {

		var tmpClass = $('#'+e.target.id).attr('class'),
			tmpArr;

		if (tmpClass != null) {
			 tmpArr = tmpClass.split(" ");
			if (tmpArr[0] == 'menutab') {
				return;
			}
		}

		nav.changeClass(null, 'hovered');
	});

	// Deselect when fucking about in the canvas_container
	$('#canvas_container').mouseover(function() {

		nav.changeClass(null, 'hovered');

	});


	// Click actions
	$('.menutab').click(function(e) {

		// color selection.
		nav.changeClass(this, 'selected');

		nav.fillStep(this.id);

	});


});


function Navigation() {

	// Class variables.
	this.opacity = 0.4;			// Not sure if we will need this.
	this.tabs = 3;
	this.tabId = "#step";
	this.contentId = "#content_container";
	this.contentFile = "contentfile.html";
	this.stepName = "Steg";

	// Invoking class functions.
	this.fillMenutab();

}

Navigation.prototype.fillMenutab = function () {

	var stepName = this.stepName,
		tabId = this.tabId;

	for (var i = 1; i <= this.tabs; i++) {
		var tmpTxt = stepName+" "+i;

		tmpTxt = tmpTxt.split("").join("<br>");

		$(tabId+i).html("<span>"+tmpTxt+"</span>");

	}

}

Navigation.prototype.fillStep = function (step) {


	// Either load static stuff from contentfile.
	$(this.contentId).load(this.contentFile +" #content_"+step);

	// Or create a bunch of html elements with js.


}

Navigation.prototype.changeClass = function(ele, clas) {

	var tabId = this.tabId;


	// Unselect all items.
	for (var i = 1; i <= this.tabs; i++) {

		$(tabId+i).removeClass(clas);

	}


	// Select item, should add check if properly selected (clicked).
	if (ele != null) {
		$(ele).addClass(clas);
	}

}
*/