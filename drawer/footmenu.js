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
    	ld = paper.set(),
    	sv = paper.set(),
    	clr = paper.set(),
    	load,
    	loadTxt,
    	save,
    	saveTxt,
    	clear,
    	clearTxt;

    paper.canvas.style.backgroundColor = '#A59C94';

	// Draws one of the predefined Raphael-icons. (folder), then transforms it to fit in the 'loadButton'-rectangle.
	load = paper.path('M28.625,26.75h-26.5V8.375h1.124c1.751,0,0.748-3.125,3-3.125c3.215,0,1.912,0,5.126,0c2.251,0,1.251,3.125,3.001,3.125h14.25V26.75z');

	// Positions the icon ~center of the paper + scales it up a bit.
    load.transform('t'+((width/6)-17)+','+((height/2)-15)+',s1.3');
    loadTxt = paper.text(width/6-1, height/2+2, "Last");

    // Add items to a set, then add mousehandlers, and set a tooltip.
    this.setHandlers(ld.push(load, loadTxt));
    ld.attr({
        title: 'Last inn fra fil'
    });

    // Mostly adding the same layout for the save button, but som changes on the positioning.
    save = paper.path('M28.625,26.75h-26.5V8.375h1.124c1.751,0,0.748-3.125,3-3.125c3.215,0,1.912,0,5.126,0c2.251,0,1.251,3.125,3.001,3.125h14.25V26.75z');
    save.transform('t'+((width/2)-17)+','+((height/2)-15)+',s1.3');
    saveTxt = paper.text(width/2-1, height/2+2, "Lagre");

    this.setHandlers(sv.push(save, saveTxt));
    sv.attr({
        title: 'Lagre til fil'
    });

    // The clear-button has a different icon, and again some other positioning-values.
    clear = paper.path('M22.157,6.545c0.805,0.786,1.529,1.676,2.069,2.534c-0.468-0.185-0.959-0.322-1.42-0.431c-1.015-0.228-2.008-0.32-2.625-0.357c0.003-0.133'+
        ',0.004-0.283,0.004-0.446c0-0.869-0.055-2.108-0.356-3.2c-0.003-0.01-0.005-0.02-0.009-0.03C20.584,5.119,21.416,5.788,22.157,6.545zM25.184,28.164H8.'+
        '052V3.646h9.542v0.002c0.416-0.025,0.775,0.386,1.05,1.326c0.25,0.895,0.313,2.062,0.312,2.871c0.002,0.593-0.027,0.991-0.027,0.991l-0.049,0.652l0.656,'+
        '0.007c0.003,0,1.516,0.018,3,0.355c1.426,0.308,2.541,0.922,2.645,1.617c0.004,0.062,0.005,0.124,0.004,0.182V28.164z');

    // Positions the icon and scales it up to same size as the other icons.
    clear.transform('t'+(((width/6)*5)-17)+','+(height/2-15)+',s2.05,1.154');
    clearTxt = paper.text((width*(5/6)-1), height/2+2, "Ny");

    this.setHandlers(clr.push(clear, clearTxt));
    clr.attr({
        title: 'Nytt rom'
    });

    // Mouseclick-actions must be added separately to each collection since they vary.
    // Actions for the 'Help'-button.
    ld.mouseup( function () {
    
        // This button will be reb0rn as a "HELP"-button (?)

    });

    // Actions for the 'Save'-button.
    sv.mouseup( function () {
        // OBS: This is the 'save as image' function-call.
        // grid.save();

    	// Currently for testing
        if (ourRoom.finished == true) {
            var path = grid.moveRoom(),
                resultGrid = new ResultGrid(path);

            scrollBox.paper.clear();
            

            setTimeout( function () {
                // I think this is a "safe" way to do this, first clear the resultGrid (in reality this is
                // the same grid as 'grid')
                // Then create our initial grid before we initalize the drawing.
                resultGrid.clear();
                resultGrid = null;
                ourRoom.clearRoom();
                tabs.select(1);
                options.showOptions(1);
                grid = new Grid();
                scrollBox = new ScrollBox();
                measurement = new Measurement();
                ourRoom = new DrawRoom(20);
                obstacles = new Obstacles();
            }, 50000);    
        }
    });

    // Clear Room and re-iniate so the user can draw a new room.
   clr.mouseup( function () {
    	ourRoom.clearRoom();
        ourRoom = new DrawRoom(20);
        tabs.select(1);
        options.showOptions(1);
        options.preDefArr = null;
        options.roomTitle != null ? options.roomTitle.remove() : null;
        
    });
}

/**
 * Set handlers for the three footer-buttons.
 * @param coll - Collection of a button(path) and the text on it.
**/
FootMenu.prototype.setHandlers = function (coll) {

    coll.attr({
        cursor: 'pointer',
    }).hover( function () {
        // Set attributes on hover.
        coll[0].attr({
            fill: 'white',
            'fill-opacity': 0.6
        });
    }, function () {
        coll[0].attr({
            opacity: 1,
            fill: ""
        });
    });
}