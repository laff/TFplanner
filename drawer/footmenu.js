/**
 * Holds the buttons/icons at the 'footer' of our GUI.
**/
function FootMenu() {
	this.footPaper = Raphael(document.getElementById('footmenu'));
	this.initFooter();
}
// The variable where the svg generated for saving is stored.
FootMenu.prototype.svg = null;
FootMenu.prototype.drawId = 'null';

/**
 * Iniates and positions all the icons and functionality for the footer-menu, including mouse-actions.
**/
FootMenu.prototype.initFooter = function() {

	var that = this,
        paper = that.footPaper,
        height = paper.height,
        width = paper.width,
        ld = paper.set(),
        sv = paper.set(),
        clr = paper.set(),
        help,
        helpTxt,
        save,
        saveTxt,
        clear,
        clearTxt,
        saveAs = function() {
            // Creating "popup" elements
            var popupDiv = document.createElement('div'),
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

        },
        /**
         *  Functionality that mainly adds functionality for the buttons "PNG", "PDF" and "Cancel".
         *  In addition it contains functions and callbacks that are invoked to obtain
         *  the functionality that allows for downloads and interaction with the server (calls to PHP).
        **/
        addAction = function() {

            var svg = that.svg,
                drawId = that.drawId,
                type = null,
                /**
                 *  Simply removes the popup element, it is called when any choice is made.
                **/
                removePopup = function() {
                    document.getElementById('saveaspopup').remove();
                },
                /**
                 *  Function that posts the drawId created by saveSVG which in turn was called upon when clicking the "Save" button.
                 *  After posting to export.php the return on success are being used as a parameter for the callback.
                 * @param : callback. The callback used is download, see below.
                **/
                postExport = function(callback) {
                    $.post(
                        'export/export.php', 
                        {'data': drawId}, 
                        function (data) {
                            callback(data, true);
                        });
                },
                /**
                 * Download function that depending on parameters given lets the user save from a dataUrl (to png) or a proper url (pdf).
                 * @param: url.
                 * @param: exporting. boolean that on true adds a prefix to the url for PDF download.
                **/
                download = function(url, exporting) {
                    console.log(url);
                    var a = document.createElement('a'),
                    // if exporting use export prefix
                    location = (exporting) ? 'export/'+url : url;
                    
                    window.open(location, '_blank');

                };

            $('#pngchosen').click(function() {
                type = '.png';
                removePopup();

                //Use canvg-package to draw on a 'not-shown' canvas-element.
                canvg(document.getElementById('myCanvas'), svg);

                // Used so we are sure that the canvas is fully loaded before .png is generated.
                setTimeout(function() {
                    // Fetch the dataURL from the 'myCanvas', then force a download of the picture, with a defined filename.
                    var dataURL = document.getElementById('myCanvas').toDataURL('image/png');

                    download(dataURL);

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

        },

        /**
         * Set handlers for the three footer-buttons.
         * @param coll - Collection of a button(path) and the text on it.
        **/
        setHandlers = function (coll) {

            coll.attr({
                cursor: 'pointer',
            }).hover( function() {
            // Set attributes on hover.
            coll[0].attr({
                fill: 'white',
                'fill-opacity': 0.6
            });

            }, function() {
                coll[0].attr({
                    opacity: 1,
                    fill: ''
                });
            });

        };

    paper.canvas.style.backgroundColor = '#A59C94';

	// Draws one of the predefined Raphael-icons. (folder), then transforms it to fit in the 'loadButton'-rectangle.
	help = paper.path('M28.625,26.75h-26.5V8.375h1.124c1.751,0,0.748-3.125,3-3.125c3.215,0,1.912,0,5.126,0c2.251,0,1.251,3.125,3.001,3.125h14.25V26.75z');

	// Positions the icon ~center of the paper + scales it up a bit.
    load.transform('t'+((width/6)-17)+','+((height/2)-15)+',s1.3');
    helpTxt = paper.text(width/6-1, height/2+2, 'Hjelp');

    // Add items to a set, then add mousehandlers, and set a tooltip.
    setHandlers(ld.push(help, helpTxt));
    ld.attr({
        title: 'Last inn fra fil'
    });

    // Mostly adding the same layout for the save button, but som changes on the positioning.
    save = paper.path('M28.625,26.75h-26.5V8.375h1.124c1.751,0,0.748-3.125,3-3.125c3.215,0,1.912,0,5.126,0c2.251,0,1.251,3.125,3.001,3.125h14.25V26.75z');
    save.transform('t'+((width/2)-17)+','+((height/2)-15)+',s1.3');
    saveTxt = paper.text(width/2-1, height/2+2, 'Lagre');

    setHandlers(sv.push(save, saveTxt));
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
    clearTxt = paper.text((width*(5/6)-1), height/2+2, 'Ny');

    setHandlers(clr.push(clear, clearTxt));
    clr.attr({
        title: 'Nytt rom'
    });

    // Mouseclick-actions must be added separately to each collection since they vary.
    // Actions for the 'Help'-button.
    ld.mouseup( function() {
    
        // This button will be reb0rn as a "HELP"-button (?)
        $.ajax({
            url: 'export/export.php',
            success: function() {
                console.log('file saved to server, now let the user download!');
            }
        });

    });

    // Actions for the 'Save'-button.
    sv.mouseup( function() {

        // save svg and entry ID (drawid).
        TFplanner.grid.save(saveAs);

    });

    // Clear Room and re-iniate so the user can draw a new room.
   clr.mouseup( function() {

        that.clearAll();
        
    });
};

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
FootMenu.prototype.clearAll = function() {

 /*
 *  TODO! Put all of this inside a contructor for our script?
 *
 */

    var ns = TFplanner;

    // Remove any visuals
    ns.resultGrid = (ns.resultGrid != null) ? ns.resultGrid.clear() : null; 
    ns.options.roomTitle = (ns.options.roomTitle != null) ? ns.options.roomTitle.remove() : null;
    ns.scrollBox.paper.clear();
    ns.ourRoom.clearRoom();
    ns.measurement.deconstructAid();

    // Create new objects
    ns.grid = new Grid();
    ns.scrollBox = new ScrollBox();
    ns.measurement = new Measurement();
    ns.ourRoom = new DrawRoom(20);
    ns.options = new Options();
    ns.tabs = new Tabs();
    ns.obstacles = new Obstacles();
};