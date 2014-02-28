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
		tabs = this;


	rooms = paper.path('M 0 0 L '+width+' 0 L '+width+' '+height+' L 0 '+(height-35)+' L 0 0').attr({
        fill: '#FF7D40',
        stroke: '#FF7D40',
        'stroke-width': 0
	});

	obstacles = paper.path('M 0 '+(height-35)+' L '+width+' '+height+' L '+width+' '+height*2+' L 0 '+((height*2)+35)+' L 0 '+height).attr({
        fill: '#b2cecf',
        stroke: '#b2cecf',
        'stroke-width': 0
	});

	specs = paper.path('M 0 '+((height*2)+35)+' L '+width+' '+height*2+' L '+width+' '+height*3+' L 0 '+height*3+' L 0 '+height*2).attr({
        fill: '#9ACD32',
        stroke: '#9ACD32',
        'stroke-width': 0
	});

	roomTxt = paper.text(width/2, height/2, "Tegn rom").attr({
		'font-size': 14,
	});
	roomTxt.rotate(90);


	obstTxt = paper.text(width/2, paper.height/2, "Hindringer").attr({
		'font-size': 14,
	});
	obstTxt.rotate(90);

	specTxt = paper.text(width/2, (paper.height/2)+height, "Spesifikasjoner").attr({
		'font-size': 14,
	});
	specTxt.rotate(90);

	this.room.push(rooms, roomTxt);
	this.obst.push(obstacles, obstTxt);
	this.spec.push(specs, specTxt);


	/**
	 *	Room action!
	 *
	**/
	room.attr({
        cursor: 'pointer',

        }).mouseover(function(e) {
            rooms.attr('opacity', 0.6);	

        }).mouseout(function(e) {
            rooms.attr('opacity', 1); 

        }).mouseup(function(e) {

        	tabs.select(1);

        	if (options != null) {
        		options.showOptions(1);
    		}
        	// We gonna need some action, we gonna need some action soon!
    });

	/**
	 *	Obstacle action!
	 *
	**/
	obst.attr({
        cursor: 'pointer',

        }).mouseover(function(e) {
            obstacles.attr('opacity', 0.6);

        }).mouseout(function(e) {
            obstacles.attr('opacity', 1);

        }).mouseup(function(e) {
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
            specs.attr('opacity', 0.6);

        }).mouseout(function(e) {
            specs.attr('opacity', 1);

        }).mouseup(function(e) {
        	options.showOptions(3);
        	// We gonna need some action, we gonna need some action soon!
    });
}

/**
 * Functionality that does visual changes on tab select.
 *
**/
Tabs.prototype.select = function (index) {

	// Different actions for each of the tabs.
	switch (index) {

		case 1 : 

			// Change the bottom line of the first tab.
			this.roomTabConvert();
			break;

		case 2 : 

			break;

		case 3 :

			break;
	}


 /*
		This logic works on the first tab.

         	var pathArr = this.attr("path"),
        		tmp = pathArr[3][2];

        	pathArr[3][2] = pathArr[2][2];
        	pathArr[2][2] = tmp;

        	this.attr({path: pathArr});
        	room.toFront();
*/
}

Tabs.prototype.roomTabConvert = function () {
 	var pathArr = this.room.attr("path"),
		tmp = pathArr[3][2];

	pathArr[3][2] = pathArr[2][2];
	pathArr[2][2] = tmp;

	room.attr({path: pathArr});
}