// Create the tabs displayed on the page
function Tabs () {
	this.tabPaper = Raphael(document.getElementById('menu'));
	this.room = this.tabPaper.set();
	this.obst = this.tabPaper.set();
	this.spec = this.tabPaper.set();
	this.roomColor = '#CBC4BC';
	this.obstColor = '#B6ADA5';
	this.specColor = '#A59C94';

	this.initTabs();
}

/**
 * Creating SVG-paths for the three vertical tabs, and adding text to them.
 * 
**/
Tabs.prototype.initTabs = function () {
	var paper = this.tabPaper,					
		room = this.room,			// Sets for the different tabs
		obst = this.obst,
		spec = this.spec,
		height = paper.height/3,	//Make the tabs fit the size of the paper.
		width = paper.width,
		diffHeight = 35,

	rooms = paper.path('M 0 0 L '+width+' 0 L '+width+' '+(height)+' L 0 '+(height+diffHeight)+' L 0 0').attr({
        fill: this.roomColor,
        stroke: this.roomColor,
        'stroke-width': 0,
        title: "Klikk for rom-tegning"
	}),

	obstacles = paper.path('M 0 '+(height-diffHeight)+' L '+width+' '+height+' L '+width+' '+height*2+' L 0 '+((height*2)+diffHeight)+' L 0 '+height).attr({
        fill: this.obstColor,
        stroke: this.obstColor,
        'stroke-width': 0,
        title: "Klikk for innsetting av hindringer"
	}),

	specs = paper.path('M 0 '+((height*2)-diffHeight)+' L '+width+' '+height*2+' L '+width+' '+height*3+' L 0 '+height*3+' L 0 '+height*2).attr({
        fill: this.specColor,
        stroke: this.specColor,
        'stroke-width': 0,
        title: "Klikk for valg av spesifikasjoner"
	}),

	roomTxt = paper.text(width/2, height/2, "Tegne rom"),
	obstTxt = paper.text(width/2, paper.height/2, "Hindringer"),
	specTxt = paper.text(width/2, (paper.height/2)+height, "Spesifikasjoner");

	roomTxt.rotate(90);
	obstTxt.rotate(90);
	specTxt.rotate(90);

	this.createHandlers(this.room.push(rooms, roomTxt), 1, this.roomColor);
	this.createHandlers(this.obst.push(obstacles, obstTxt), 2, this.obstColor);
	this.createHandlers(this.spec.push(specs, specTxt), 3, this.specColor);

	// Default select.
	this.select(1);
}

/**
 * Function that set handlers and color-stuff for the tabs.
 * @param coll - A set of elements that we set the handlers for.
 * @param val - The tab-number.
 * @param color - The color for the incoming collection, defined in class.
**/
Tabs.prototype.createHandlers = function (coll, val, color) {

	coll[1].attr({
		'font-size': 24,
		'fill': 'black',
		'font-weight': 'bold'
	});

    coll.attr({
        cursor: 'pointer'
    }).mouseup(function () {
    	TFplanner.tabs.select(val);
    	TFplanner.options.showOptions(val);
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
			this.room[1].attr('fill', '#CB2C30');
			this.obst[1].attr('fill', 'black');
			this.spec[1].attr('fill', 'black');
			break;

		case 2 : 
			this.obst.toFront();
			this.obst[1].attr('fill', '#CB2C30');
			this.room[1].attr('fill', 'black');
			this.spec[1].attr('fill', 'black');
			break;

		case 3 :
			this.spec.toFront();
			this.spec[1].attr('fill', '#CB2C30');
			this.room[1].attr('fill', 'black');
			this.obst[1].attr('fill', 'black');
			break;
	}
}

