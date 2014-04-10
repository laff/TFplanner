/**
 * Holds the buttons/icons at the 'footer' of our GUI.
**/
function FootMenu () {
	this.footPaper = Raphael(document.getElementById('footmenu'));
	this.initFooter();
    this.svg;
    this.drawId = 'fuckall';
}

/**
 * Iniates and positions all the icons and functionality for the footer-menu, including mouse-actions.
**/
FootMenu.prototype.initFooter = function () {
	var paper = this.footPaper,
        that = this,
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
    	clearTxt,
        saveAs = function() {
            var svg = footmenu.svg,
                drawId = footmenu.drawId,

                // Creating "popup" elements
                popupDiv = document.createElement('div'),
                qText = document.createElement('p'),
                buttonPNG = document.createElement('button'),
                buttonPDF = document.createElement('button'),
                buttonCancel = document.createElement('button');


            popupDiv.id = 'saveaspopup';

            qText.innerHTML = 'Lagre som PNG eller PDF?';

            buttonPNG.id = 'pngchosen';
            buttonPNG.innerHTML = 'PNG';

            buttonPDF.id = 'pdfchosen';
            buttonPDF.innerHTML = 'PDF';

            buttonCancel.id = 'cancelExport';
            buttonCancel.innerHTML = 'Avbryt';

            popupDiv.appendChild(qText);
            popupDiv.appendChild(buttonPNG);
            popupDiv.appendChild(buttonPDF);
            popupDiv.appendChild(buttonCancel);

            $('#container').append(popupDiv);

            // call function that adds action listeners
            addAction();

            // THE FUNCITONALITY BENEATH IS MENT FOR DOWNLOADING IMAGE (PNG).

            /*

                //Use canvg-package to draw on a 'not-shown' canvas-element.
                canvg(document.getElementById('myCanvas'), svg);

                // Used so we are sure that the canvas is fully loaded before .png is generated.
                setTimeout(function () {
                    // Fetch the dataURL from the 'myCanvas', then force a download of the picture, with a defined filename.
                    var dataURL = document.getElementById('myCanvas').toDataURL("image/png"),
                        a = document.createElement('a');
                        a.href = dataURL;
                        a.download = options.projectName+'.png';
                        a.click();

                    return svg;
                }, 100);
            */

        },
        /**
         *  
         *
        **/
        addAction = function() {

            var svg = footmenu.svg,
                drawId = footmenu.drawId,
                type = null,
                removePopup = function() {
                    document.getElementById('saveaspopup').remove();
                },
                postExport = function(callback) {
                    $.post(
                        'export/export.php', 
                        {'data': drawId}, 
                        function (data) {
                            callback(data, true);
                        });
                },
                download = function(url, exporting) {
                    console.log(url);
                    var a = document.createElement('a');
                    // if exporting use export prefix
                    a.href = (exporting) ? 'export/'+url : url;
                    a.download = options.projectName+type;
                    a.click();
                };

            $('#pngchosen').click(function() {
                type = '.png';
                removePopup();

                //Use canvg-package to draw on a 'not-shown' canvas-element.
                canvg(document.getElementById('myCanvas'), svg);

                // Used so we are sure that the canvas is fully loaded before .png is generated.
                setTimeout(function () {
                    // Fetch the dataURL from the 'myCanvas', then force a download of the picture, with a defined filename.
                    var dataURL = document.getElementById('myCanvas').toDataURL("image/png");

                    download(dataURL);

                    /*
                        a = document.createElement('a');
                    a.href = dataURL;
                    a.download = options.projectName+'.png';
                    a.click();
                    */
                }, 100);
            });

            $('#pdfchosen').click(function() {
                type = '.pdf';
                removePopup();
                postExport(download); 
            });

            $('#cancelExport').click(function() {
                removePopup();
            });

        };

    paper.canvas.style.backgroundColor = '#A59C94';

	// Draws one of the predefined Raphael-icons. (folder), then transforms it to fit in the 'loadButton'-rectangle.
	load = paper.path('M28.625,26.75h-26.5V8.375h1.124c1.751,0,0.748-3.125,3-3.125c3.215,0,1.912,0,5.126,0c2.251,0,1.251,3.125,3.001,3.125h14.25V26.75z');

	// Positions the icon ~center of the paper + scales it up a bit.
    load.transform('t'+((width/6)-17)+','+((height/2)-15)+',s1.3');
    loadTxt = paper.text(width/6-1, height/2+2, "Hjelp");

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
        $.ajax({
            url: 'export/export.php',
            success: function() {
                console.log("file saved to server, now let the user download!");
            }
        });

    });

    // Actions for the 'Save'-button.
    sv.mouseup( function () {

        // save svg and entry ID (drawid).
        grid.save(saveAs);

    });

    // Clear Room and re-iniate so the user can draw a new room.
   clr.mouseup( function () {

        that.clearAll();
        
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

/**
 * Function to clear ALL stuff and create new instances of them, so that the
 * user can create a new drawing, this includes:
 * ResultGrid
 * Grid
 * ScrollBox
 * Measurement
 * DrawRoom
 * Obstacles
 * Mats
**/
FootMenu.prototype.clearAll = function () {

/* INFO: I think this is a "safe" way to do this, first clear the resultGrid (in reality this is
 * the same grid as 'grid')
 * Then create our initial grid before we initalize the drawing.
 */
    (resultGrid != null) ? resultGrid.clear() : null; 
    (options.roomTitle != null) ? options.roomTitle.remove() : null;
    options.preDefArr = null;
    scrollBox.paper.clear();

    ourRoom.clearRoom();
    tabs.select(1);
    options.showOptions(1);
    grid = new Grid();
    scrollBox = new ScrollBox();
    measurement = new Measurement();
    ourRoom = new DrawRoom(20);
    obstacles = new Obstacles();
    mattur = new Mats();
}