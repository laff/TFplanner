/**
 * Holds the buttons/icons at the 'footer' of our GUI.
**/
function FootMenu () {
	this.footPaper = Raphael(document.getElementById('footmenu'));
	this.initFooter();
}

/**
 * Iniates and positions all the icons and functionality for the footer-menu, including mouse-actions.
**/
FootMenu.prototype.initFooter = function () {
	var paper = this.footPaper,
	height = paper.height,
	width = paper.width,
	coll1 = paper.set(),
	coll2 = paper.set(),
	coll3 = paper.set(),
	load,
	loadTxt,
	save,
	saveTxt,
	clear,
	clearTxt;

    paper.canvas.style.backgroundColor = '#999999';

	// Draws one of the predefined Raphael-icons. (folder), then transforms it to fit in the 'loadButton'-rectangle.
	load = paper.path('M28.625,26.75h-26.5V8.375h1.124c1.751,0,0.748-3.125,3-3.125c3.215,0,1.912,0,5.126,0c2.251,0,1.251,3.125,3.001,3.125h14.25V26.75z').attr({
        title: 'Last inn fra fil'
	});

	// Positions the icon ~center of the paper + scales it up a bit.
    load.transform('t'+((width/6)-17)+','+((height/2)-15)+',s1.3');
    // The text on the "button", also with a tooltip!
    loadTxt = paper.text(width/6-1, height/2+2, "Last").attr({
        'text-anchor': "middle",
         title: 'Last inn fra fil'
    });

    // Mostly adding the same layout for the save button, but som changes on the positioning.
    save = paper.path('M28.625,26.75h-26.5V8.375h1.124c1.751,0,0.748-3.125,3-3.125c3.215,0,1.912,0,5.126,0c2.251,0,1.251,3.125,3.001,3.125h14.25V26.75z').attr({
        title: 'Lagre til fil'
    });

    save.transform('t'+((width/2)-17)+','+((height/2)-15)+',s1.3');

    saveTxt = paper.text(width/2-1, height/2+2, "Lagre");

    // The clear-button has a different icon, and again some other positioning-values.
    clear = paper.path('M22.157,6.545c0.805,0.786,1.529,1.676,2.069,2.534c-0.468-0.185-0.959-0.322-1.42-0.431c-1.015-0.228-2.008-0.32-2.625-0.357c0.003-0.133,0.004-0.283,0.004-0.446c0-0.869-0.055-2.108-0.356-3.2c-0.003-0.01-0.005-0.02-0.009-0.03C20.584,5.119,21.416,5.788,22.157,6.545zM25.184,28.164H8.052V3.646h9.542v0.002c0.416-0.025,0.775,0.386,1.05,1.326c0.25,0.895,0.313,2.062,0.312,2.871c0.002,0.593-0.027,0.991-0.027,0.991l-0.049,0.652l0.656,0.007c0.003,0,1.516,0.018,3,0.355c1.426,0.308,2.541,0.922,2.645,1.617c0.004,0.062,0.005,0.124,0.004,0.182V28.164z').attr({
        title: 'Nytt rom',
    });

    // Positions the icon and scales it up to same size as the other icons.
    clear.transform('t'+(((width/6)*5)-17)+','+(height/2-15)+',s2.05,1.154');
    
    clearTxt = paper.text((width*(5/6)-1), height/2+2, "Ny").attr({
         title: 'Nytt rom'
    });

    // Push the paths and text to Raphael-sets. We do this because the text is placed on top of the path,
    // and we want the click-action to be executed when the text OR the icon is clicked.
	coll1.push(load, loadTxt);
    coll2.push(save, saveTxt);
    coll3.push(clear, clearTxt);

    coll1.attr({
        cursor: 'pointer',
    }).mouseover(function(e) {
        // Set attributes on mouseover.
        load.attr({
        	fill: 'white',
        	'fill-opacity': 0.6
   		});
        // Change back to default-attributes on mouse-out.
    }).mouseout(function(e) {
        load.attr({
        	opacity: 1,
        	fill: ""
        });

    }).mouseup(function(e) {
    	// Load a room from a file
    });

    coll2.attr({
        cursor: 'pointer',
    }).mouseover(function(e) {
        save.attr({
        	fill: 'white',
        	'fill-opacity': 0.6
   		});

    }).mouseout(function(e) {
        save.attr({
        	opacity: 1,
        	fill: ""
        });

    }).mouseup(function(e) {
    	// Currently for testing
        if (ourRoom.finished == true) {
            grid.paper.clear();
            var resultGrid = new ResultGrid();
           ourRoom.clearRoom();
            
            setTimeout(function(){
                ourRoom = new DrawRoom(20);
                resultGrid.clear();
                grid.draw();
            }, 50000);
            
        }
    });
	
   coll3.attr({
        cursor: 'pointer',
    }).mouseover(function(e) {
        clear.attr({
        	fill: 'white',
        	'fill-opacity': 0.6
   		});

    }).mouseout(function(e) {
        clear.attr({
        	opacity: 1,
        	fill: ""
        });

    }).mouseup(function(e) {
    	// Clear Room and re-iniate so the user can draw.
    	ourRoom.clearRoom();
        options.showOptions(1);
        options.preDefArr = null;
    });
}