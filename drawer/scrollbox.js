function ScrollBox () {
	this.paper = Raphael(document.getElementById('navigation_container'));
	var paper = this.paper, 
		frame = paper.rect(0, 0, 100, 100, 0),
		innerFrame = paper.rect(26, 26, 48, 48, 0),
		up, 
		down,
		right,
		left,
		zoom,
		out;
	frame.attr({
		'fill': "#cbc4bc",
		'stroke-width': 0.5,
		opacity: 0.6
	});
	innerFrame.attr({
		'stroke-opacity': 0,
		'fill': "#B6ADA5",
		opacity: 0.8
	});


    //The strings and stroke settings for the arrow buttons
	var stroke = {stroke: "#a59c94", "stroke-width": 3, 'fill': "white"},
		uparrow = "M23.963,20.834L17.5,9.64c-0.825-1.429-2.175-1.429-3,0L8.037,20.834c"+
			"-0.825,1.429-0.15,2.598,1.5,2.598h12.926C24.113,23.432,24.788,22.263,23.963,20.834z",
		downarrow = "M8.037,11.166L14.5,22.359c0.825,1.43,2.175,1.43,3,0l6.463-11.194c"+
			"0.826-1.429,0.15-2.598-1.5-2.598H9.537C7.886,8.568,7.211,9.737,8.037,11.166z",
		rightarrow = "M11.166,23.963L22.359,17.5c1.43-0.824,1.43-2.175,0-3L11.166,8.037c"+
			"-1.429-0.826-2.598-0.15-2.598,1.5v12.926C8.568,24.113,9.737,24.789,11.166,23.963z",
		leftarrow = "M20.834,8.037L9.641,14.5c-1.43,0.824-1.43,2.175,0,3l11.193,6.463c"+
			"1.429,0.826,2.598,0.15,2.598-1.5V9.537C23.432,7.887,22.263,7.211,20.834,8.037z", 
		plus = "M25.979,12.896 19.312,12.896 19.312,6.229 12.647,6.229 12.647,12.896 5.979,12.896 5.979,19.562 12.647,19.562 12.647,26.229 19.312,26.229 19.312,19.562 25.979,19.562z",
		minus = "M25.979,12.896,5.979,12.896,5.979,19.562,25.979,19.562z";

	//Creating and placing arrow buttons
	up = paper.path(uparrow).attr(stroke);
	up.translate(34, -3);
	this.funkify(up);
	down = paper.path(downarrow).attr(stroke);
	down.translate(34, 71);
	this.funkify(down);
	right = paper.path(rightarrow).attr(stroke);
	right.translate(71, 34);
	this.funkify(right);
	left = paper.path(leftarrow).attr(stroke);
	left.translate(-3, 34);
	this.funkify(left);
	zoom = paper.path(plus).attr(stroke);
	zoom.attr({title: "Zoom inn"});
	zoom.translate(34, 24);
	this.funkify(zoom);
	out = paper.path(minus).attr(stroke);
	out.attr({title: "Zoom ut"});
	out.translate(34, 46);
	this.funkify(out);


	//Button handlers
	//The preventDefault bits prevents on-screen text from
	// being highlighted due to mouse (double)clicks
	frame.mousedown(function (e) {
		e.preventDefault();
	});
	innerFrame.mousedown(function (e) {
		e.preventDefault();
	});
	up.mousedown(function (e) {
        e.preventDefault();
		grid.pan(38);
	});
	down.mousedown(function (e) {
		e.preventDefault();
		grid.pan(40);
	});
	left.mousedown(function (e) {
		e.preventDefault();
		grid.pan(37);
	});
	right.mousedown(function (e) {
		e.preventDefault();
		grid.pan(39);
	});
	zoom.mousedown(function (e) {
		e.preventDefault();
		grid.handle(1);
	});
	out.mousedown(function (e) {
		e.preventDefault();
		grid.handle(-1);
	});
}

//Function gives a highlights button on mouseover
// and makes it look ... funky
ScrollBox.prototype.funkify = function(button) {

	button.hover(
		function () {
	        button.attr({
        		cursor: 'pointer',
				'stroke-opacity': 0.5,
	        	fill: "white",
	        	'fill-opacity': 0.8
	    	});
	    }, 
	    function () {
	        button.attr({
	        	'stroke': '#a59c94',
	        	'stroke-opacity': 1
	        });
    	}
    );
}