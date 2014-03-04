function FootMenu () {
	this.footPaper = Raphael(document.getElementById('footmenu'));
	this.initFooter();
}

FootMenu.prototype.initFooter = function () {
	var paper = this.footPaper,
	height = paper.height,
	width = paper.width,
	coll1 = paper.set(),
	coll2 = paper.set(),
	coll3 = paper.set(),
	load,
	loadTxt,
	loadButton,
	save,
	saveButton,
	saveTxt,
	clear,
	clearTxt,
	clearButton;

	// Background-rectangle for the button/icon.
	loadButton = paper.rect(0, 0, (width/3)+1, height).attr({
        fill: '#70B8DC',
        'stroke': '#525E65',
        'stroke-width': 0
	});

	// Draws one of the predefined Raphael-icons. (folder), then transforms it to fit in the 'loadButton'-rectangle.
	load = paper.path('M28.625,26.75h-26.5V8.375h1.124c1.751,0,0.748-3.125,3-3.125c3.215,0,1.912,0,5.126,0c2.251,0,1.251,3.125,3.001,3.125h14.25V26.75z').attr({
        title: 'Last inn fra fil'
	});

	//Positions the icon ~center of the rectangle + scales it up a bit.
    load.transform('t'+((width/6)-17)+','+((height/2)-15)+',s1.3');
    // The text on the "button", also with a tooltip!
    loadTxt = paper.text(width/6-1, height/2+2, "Last").attr({
        'text-anchor': "middle",
         title: 'Last inn fra fil'
    });

	coll1.push(load, loadTxt);

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

    saveButton = paper.rect(width/3, 0, (width/3)+1, height).attr({
        fill: '#70B8DC',
        'stroke': '#525E65',
        'stroke-width': 0
	});

    save = paper.path('M28.625,26.75h-26.5V8.375h1.124c1.751,0,0.748-3.125,3-3.125c3.215,0,1.912,0,5.126,0c2.251,0,1.251,3.125,3.001,3.125h14.25V26.75z').attr({
    	title: 'Lagre til fil'
    });

    save.transform('t'+((width/2)-17)+','+((height/2)-15)+',s1.3');

    saveTxt = paper.text(width/2-1, height/2+2, "Lagre");

    coll2.push(save, saveTxt);

    coll2.attr({
        cursor: 'pointer',
    }).mouseover(function(e) {
        // Set attributes on mouseover.
        save.attr({
        	fill: 'white',
        	'fill-opacity': 0.6
   		});
    // Change back to default-attributes on mouse-out.
    }).mouseout(function(e) {
        save.attr({
        	opacity: 1,
        	fill: ""
        });

    }).mouseup(function(e) {
    	// Save a room to a file
    });

    clearButton = paper.rect((width*(2/3)), 0, (width/3)+1, height).attr({
        fill: '#70B8DC',
        'stroke': '#525E65',
        'stroke-width': 0
	});
	
	clear = paper.path('M22.157,6.545c0.805,0.786,1.529,1.676,2.069,2.534c-0.468-0.185-0.959-0.322-1.42-0.431c-1.015-0.228-2.008-0.32-2.625-0.357c0.003-0.133,0.004-0.283,0.004-0.446c0-0.869-0.055-2.108-0.356-3.2c-0.003-0.01-0.005-0.02-0.009-0.03C20.584,5.119,21.416,5.788,22.157,6.545zM25.184,28.164H8.052V3.646h9.542v0.002c0.416-0.025,0.775,0.386,1.05,1.326c0.25,0.895,0.313,2.062,0.312,2.871c0.002,0.593-0.027,0.991-0.027,0.991l-0.049,0.652l0.656,0.007c0.003,0,1.516,0.018,3,0.355c1.426,0.308,2.541,0.922,2.645,1.617c0.004,0.062,0.005,0.124,0.004,0.182V28.164z').attr({
		title: 'Nytt rom',
	});


	clear.transform('t'+(((width/6)*5)-15)+','+(height/2-14.5)+',s1.1');
	clearTxt = paper.text((width*(5/6)), height/2+2, "Ny");

    coll3.push(clear, clearTxt);

    coll3.attr({
        cursor: 'pointer',
    }).mouseover(function(e) {
        // Set attributes on mouseover.
        clear.attr({
        	fill: 'white',
        	'fill-opacity': 0.6
   		});
    // Change back to default-attributes on mouse-out.
    }).mouseout(function(e) {
        clear.attr({
        	opacity: 1,
        	fill: ""
        });

    }).mouseup(function(e) {
    	// Clear Room and re-iniate so the user can draw.
    	ourRoom.clearRoom();
    		
    });
}