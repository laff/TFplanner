// Creates the button on the very top of our options-container
function HeadMenu() {
	this.headPaper = Raphael(document.getElementById('headmenu'));
	this.initMenu();
}

/**
 * Sets up the 'Head-menu' with two buttons and some text + handlers
**/

HeadMenu.prototype.initMenu = function () {
	var paper = this.headPaper,
        height = paper.height,
        width = paper.width/2,      //Less typing is needed later if we divide the width on 2 here.
		button1,
		button2,
		text1,
		text2,
		coll1 = paper.set(),
		coll2 = paper.set();

        // Coordinates of the buttons based on the size of the paper, not very elegant.
	button1 = paper.path('M 0 0 L '+(width+20)+' 0 L '+(width-20)+' '+height+' L 0 '+height+' L 0 0').attr({
        fill: '#404040',
        stroke: '#404040',
        'stroke-width': 0,
        opacity: 0.8,
	});

	button2 = paper.path('M '+(width+20)+' 0 L '+width*2+' 0 L '+width*2+' '+height+' L '+(width-20)+' '+height+ ' L '+(width+20)+' 0').attr({
        fill: '#6d8383',
        stroke: '#6d8383',
        'stroke-width': 0,
        opacity: 0.8,
	});

    // Text-elements, centered on the buttons.
	text1 = paper.text(width/2 , height/2, "Button 1");
	text2 = paper.text(((width/2*3)), height/2, "Button 2");


	    // Add the stuff to a set and create mousehandlers to the button.
        coll1.push(button1, text1);

        coll1.attr({
            cursor: 'pointer',
        }).mouseover(function(e) {
            button1.attr('opacity', 0.5);   //'fill', '#6d8383');

        }).mouseout(function(e) {
            button1.attr('opacity', 0.8);//'fill', '#404040');

        }).mouseup(function(e) {
        	// Some action
        });


    	coll2.push(button2, text2);

        coll2.attr({
            cursor: 'pointer',
        }).mouseover(function(e) {
            button2.attr('opacity', 0.5);   //'fill', '#6d8383');

        }).mouseout(function(e) {
            button2.attr('opacity', 0.8);   //'fill', '#b2cecf');

        }).mouseup(function(e) {
        	// We gonna need some action, we gonna need some action soon!
        });
}