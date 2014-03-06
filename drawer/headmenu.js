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
        width = paper.width,
		text1,
		text2,
		coll1 = paper.set(),
		coll2 = paper.set(),

    // Coordinates of the buttons based on the size of the paper
	button1 = paper.rect(0, 0, (width/2)+1, height).attr({
        fill: '#D6D6D6',
        'stroke-width': 0
	}),

	button2 = paper.rect((width/2), 0, (width/2), height).attr({
        fill: '#D6D6D6',
        'stroke-width': 0
	});

    // Text-elements, centered on the buttons.
	text1 = paper.path('M29.548,3.043c-1.081-0.859-2.651-0.679-3.513,0.401 L16,16.066l-3.508-4.414c-0.859-1.081-2.431-1.26-3.513-0.401c-1.081,'+
        '0.859-1.261,2.432-0.401,3.513l5.465,6.875c0.474,0.598,1.195,0.944,1.957,0.944c0.762,0,1.482-0.349,1.957-0.944L29.949,6.556C30.809,5.475,'+
        '30.629,3.902,29.548,3.043zM24.5,24.5h-17v-17h12.756l2.385-3H6C5.171,4.5,4.5,5.171,4.5,6v20c0,0.828,0.671,1.5,1.5,1.5h20c0.828,0,1.5-0.672,'+
        '1.5-1.5V12.851l-3,3.773V24.5z');
    text1.transform('t'+(width/6)+','+height/12+',s1.2');

    text2 = paper.path('M27.87,7.863L23.024,4.82l-7.889,12.566l4.842,3.04L27.87,7.863zM14.395,21.25l-0.107,2.855l2.527-1.337l2.349-1.24l-4.672-2.936'+
        'L14.395,21.25zM29.163,3.239l-2.532-1.591c-0.638-0.401-1.479-0.208-1.882,0.43l-0.998,1.588l4.842,3.042l0.999-1.586C29.992,4.481,29.802,3.639,'+
        '29.163,3.239zM25.198,27.062c0,0.275-0.225,0.5-0.5,0.5h-19c-0.276,0-0.5-0.225-0.5-0.5v-19c0-0.276,0.224-0.5,0.5-0.5h13.244l1.884-3H5.698c-1.93,'+
        '0-3.5,1.57-3.5,3.5v19c0,1.93,1.57,3.5,3.5,3.5h19c1.93,0,3.5-1.57,3.5-3.5V11.097l-3,4.776V27.062z');
    text2.transform('t'+(width*(2/3))+','+height/15+'');

    // Add the stuff to a set and create mousehandlers to the button.
    coll1.push(button1, text1);

    coll1.attr({
        cursor: 'pointer',
    }).mouseover(function(e) {
        text1.attr('fill', "white");   //'fill', '#6d8383');
        text1.attr('fill-opacity', 0.6);

    }).mouseout(function(e) {
        text1.attr('opacity', 1);   //'fill', '#404040');
        text1.attr('fill', "");     //'fill', '#6d8383');


    }).mouseup(function(e) {
    	// Show the paper with pre-defined rooms and stuff
        options.showOptions(1);

    });



    // button one action.
	coll2.push(button2, text2);

    coll2.attr({
        cursor: 'pointer',
    }).mouseover(function(e) {
       // button2.attr('opacity', 0.6);   //'fill', '#6d8383');
        text2.attr('fill', "white");   //'fill', '#6d8383');
        text2.attr('fill-opacity', 0.6);
    }).mouseout(function(e) {
       // button2.attr('opacity', 1);   //'fill', '#b2cecf');
        text2.attr('opacity', 1);//'fill', '#404040');
        text2.attr('fill', ""); 

    }).mouseup(function(e) {
        // Show the html-page, where the user can enter his own length of walls and stuff.
        options.showOptions(4);
    });
}
