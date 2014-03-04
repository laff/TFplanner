// Create the tabs displayed on the page
function Tabs() {
	this.tabPaper = Raphael(document.getElementById('menu'));
	
	this.room = this.tabPaper.set();
	this.obst = this.tabPaper.set();
	this.spec = this.tabPaper.set();

	this.initTabs();

}

/**
 * Creating SVG-paths for the three vertical tabs, and adding text to them + mousehandlers.
 * OBS: This function should maybe be splitted? Lot of duplication for setting the handlers etc.
**/

Tabs.prototype.initTabs = function () {
	var paper = this.tabPaper,
		rooms,						
		obstacles, 
		specs,
		roomTxt,
		obstTxt,
		specTxt,
		room = this.room,		// Sets for the different tabs
		obst = this.obst,
		spec = this.spec,
		height = paper.height/3,	//Make the tabs fit the size of the paper.
		width = paper.width,
		diffHeight = 35;
		tabs = this;

	rooms = paper.path('M 0 0 L '+width+' 0 L '+width+' '+(height)+' L 0 '+(height+diffHeight)+' L 0 0').attr({
        fill: '#D6D6D6',
        stroke: '#D6D6D6',
        'stroke-width': 0
	});

	obstacles = paper.path('M 0 '+(height-diffHeight)+' L '+width+' '+height+' L '+width+' '+height*2+' L 0 '+((height*2)+diffHeight)+' L 0 '+height).attr({
        fill: '#BDBDBD',
        stroke: '#BDBDBD',
        'stroke-width': 0
	});

	specs = paper.path('M 0 '+((height*2)-diffHeight)+' L '+width+' '+height*2+' L '+width+' '+height*3+' L 0 '+height*3+' L 0 '+height*2).attr({
        fill: '#999999',
        stroke: '#999999',
        'stroke-width': 0
	});

	roomTxt = paper.text(width/2, height/2, "Tegn rom").attr({
		'font-size': 20,
		'fill': '#D6D6D6',
		'stroke-width': 1,
		'stroke': 'black',
		'letter-spacing': 2
	});
	roomTxt.rotate(90);


	obstTxt = paper.text(width/2, paper.height/2, "Hindringer").attr({
		'font-size': 20,
		'fill': '#BDBDBD',
		'stroke-width': 1,
		'stroke': 'black',
		'letter-spacing': 2
	});
	obstTxt.rotate(90);

	specTxt = paper.text(width/2, (paper.height/2)+height, "Spesifikasjoner").attr({
		'font-size': 20,
		'fill': '#999999',
		'stroke-width': 1,
		'stroke': 'black',
		'letter-spacing': 2
	});
	specTxt.rotate(90);

	this.room.push(rooms, roomTxt);
	this.obst.push(obstacles, obstTxt);
	this.spec.push(specs, specTxt);


	// Default select.
	this.select(1);


	/**
	 *	Room action!
	 *
	**/
	room.attr({
        cursor: 'pointer',

        }).mouseover(function(e) {
            roomTxt.attr('fill', 'white');

        }).mouseout(function(e) {
            roomTxt.attr('fill', '#D6D6D6');

        }).mouseup(function(e) {

        	tabs.select(1);

        	options.showOptions(1);
        	// We gonna need some action, we gonna need some action soon!
    });

	/**
	 *	Obstacle action!
	 *
	**/
	obst.attr({
        cursor: 'pointer',

        }).mouseover(function(e) {
            obstTxt.attr('fill', 'white');

        }).mouseout(function(e) {
            obstTxt.attr('fill', '#BDBDBD');

        }).mouseup(function(e) {
        	tabs.select(2);
        	options.showOptions(2);
        	// We gonna need some action, we gonna need some action soon!
    });

	/**
	 *	Specifications action!
	 *
	**/
	spec.attr({
        cursor: 'pointer',

        }).mouseover(function(e) {
            specTxt.attr('fill', 'white');

        }).mouseout(function(e) {
            specTxt.attr('fill', '#999999');

        }).mouseup(function(e) {
        	tabs.select(3);
        	options.showOptions(3);
        	// We gonna need some action, we gonna need some action soon!
    });
}

/**
 * Functionality that does visual changes on tab select.
 *
**/
Tabs.prototype.select = function (index) {

	// default to front
	this.spec.toFront();
	this.obst.toFront();

	// Different actions for each of the tabs.
	switch (index) {

		case 1 :
			this.room.toFront();
			break;

		case 2 : 
			this.obst.toFront();
			break;

		case 3 :
			this.spec.toFront();
			break;
	}
}
