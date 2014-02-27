// Create the tabs displayed on the page
function Tabs() {
	this.tabPaper = Raphael(document.getElementById('menu'));
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
		room = paper.set(),			// Sets for the different tabs
		obst = paper.set(),
		spec = paper.set(),
		height = paper.height/3,	//Make the tabs fit the size of the paper.
		width = paper.width;


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

	room.push(rooms, roomTxt);
	obst.push(obstacles, obstTxt);
	spec.push(specs, specTxt);

	room.attr({
        cursor: 'pointer',

        }).mouseover(function(e) {
            rooms.attr('opacity', 0.6);	

        }).mouseout(function(e) {
            rooms.attr('opacity', 1); 

        }).mouseup(function(e) {
        	// We gonna need some action, we gonna need some action soon!
    });


	obst.attr({
        cursor: 'pointer',

        }).mouseover(function(e) {
            obstacles.attr('opacity', 0.6);

        }).mouseout(function(e) {
            obstacles.attr('opacity', 1);

        }).mouseup(function(e) {
        	// We gonna need some action, we gonna need some action soon!
    });

	spec.attr({
        cursor: 'pointer',

        }).mouseover(function(e) {
            specs.attr('opacity', 0.6);

        }).mouseout(function(e) {
            specs.attr('opacity', 1);

        }).mouseup(function(e) {
        	// We gonna need some action, we gonna need some action soon!
    });
}

