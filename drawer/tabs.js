/**
 * @class Creates the tabs that is displayed on the lefthand-side
 * of the webpage. 
**/
function Tabs () {
	this.tabPaper = Raphael(document.getElementById('menu'));
	this.room = this.tabPaper.set();
	this.obst = this.tabPaper.set();
	this.spec = this.tabPaper.set();
	this.initTabs();
}
// Thermo-Floors selected colors for the tabs
Tabs.prototype.roomColor = '#CBC4BC';
Tabs.prototype.obstColor = '#B6ADA5';
Tabs.prototype.specColor = '#A59C94';

/**
 * Creating SVG-paths for the three vertical tabs, and adding text to them.
**/
Tabs.prototype.initTabs = function() {

	var height = this.tabPaper.height/3,
		width = this.tabPaper.width,
		diffHeight = 35,

	rooms = this.tabPaper.path('M 0 0 L '+width+' 0 L'+width+' '+(height)+' L 0 '+(height+diffHeight)+' L 0 0').attr({
        fill: this.roomColor,
        stroke: this.roomColor,
        'stroke-width': 0,
        title: 'Klikk for rom-tegning'
	}),

	obstacles = this.tabPaper.path('M 0 '+(height-diffHeight)+' L'+width+' '+height+' L'+width+' '+height*2+' L 0 '+((height*2)+diffHeight)+' L 0 '+height).attr({
        fill: this.obstColor,
        stroke: this.obstColor,
        'stroke-width': 0,
        title: 'Klikk for innsetting av hindringer'
	}),

	specs = this.tabPaper.path('M 0 '+((height*2)-diffHeight)+' L'+width+' '+height*2+' L'+width+' '+height*3+' L 0 '+height*3+' L 0 '+height*2).attr({
        fill: this.specColor,
        stroke: this.specColor,
        'stroke-width': 0,
        title: 'Klikk for valg av spesifikasjoner'
	}),

	roomTxt = this.tabPaper.text(width/2, height/2, 'Tegne rom'),
	obstTxt = this.tabPaper.text(width/2, this.tabPaper.height/2, 'Hindringer'),
	specTxt = this.tabPaper.text(width/2, (this.tabPaper.height/2)+height, 'Spesifikasjoner'),

	/**
	 * Function for setting handlers and color-stuff for the tabs.
	 * @param coll - A set of elements that we set the handlers for.
	 * @param val - The tab-number.
	**/
	createHandlers = function(coll, val) {

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
	};

	roomTxt.rotate(90);
	obstTxt.rotate(90);
	specTxt.rotate(90);

	createHandlers(this.room.push(rooms, roomTxt), 1);
	createHandlers(this.obst.push(obstacles, obstTxt), 2);
	createHandlers(this.spec.push(specs, specTxt), 3);

	// Default select.
	this.select(1);
};

/**
 * Functionality that does visual changes on tab select.
 * @param index - Index of the tab to set in 'focus'
**/
Tabs.prototype.select = function(index) {

	// Default tab to the front
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
};

