
/**
 * @namespace TFplanner
 * Namespace for keeping variable-names hidden for other scripts
 * @property {Grid} - Grid of the software
 * @property {ScrollBox} - Zoom- and panfunctionality
 * @property {Measurement} - Measures wall-lengths and angles
 * @property {DrawRoom} - Setting up drawing of a room
 * @property {Tabs} - Tab-functionality
 * @property {FootMenu} - FootMenu of the GUI, hold buttons
 * @property {Options} - Shows static pages for the user
 * @property {Obstacles} - Used when adding obstacles
 * @property {FinishedRoom} - A room finished by the user, initially 'null'
 * @property {latency} - Latency used for move-actions
**/
var TFplanner =  TFplanner || {};

$(document).ready(function() {

    (function () {

        TFplanner.grid = new Grid();
        TFplanner.scrollBox = new ScrollBox();
        TFplanner.measurement = new Measurement();
        TFplanner.ourRoom = new DrawRoom(20);
        TFplanner.tabs = new Tabs();
        TFplanner.footmenu = new FootMenu();
        TFplanner.options = new Options();
        TFplanner.obstacles = new Obstacles();
        TFplanner.resultGrid = null;
        TFplanner.finishedRoom = null;
        TFplanner.latency = 50;
        
    })();
});

/**
 * @class Creates the grid, and adds some of 
 * the basic-functionality to it (zoom etc.)
**/
function Grid() {
    this.paper = Raphael(document.getElementById('canvas_container'));
    this.boxSet = this.paper.set();
    this.gridSet = this.paper.set();
    this.draw();
    this.scale();
    this.zoom();
    this.viewBoxWidth = this.paper.width;
    this.viewBoxHeight = this.paper.height;
    this.resWidth = (this.viewBoxWidth / 2);
}

// Used in creation of the grid, to limit the size of it.
Grid.prototype.size = 5;
// Draw lines between two pixels, for better looks.
Grid.prototype.cutPix = 0.5;
Grid.prototype.resHeight = null;
// Indicates if zooming og paning is used
Grid.prototype.zoomed = false;

/**
 * Draws vertical and horizontal lines on the screen, and set the viewbox.
 * This is the "base" of our webpage, where all drawing and stuff will happen.
**/
Grid.prototype.draw = function() {

    var canvas = $('#canvas_container'),
        size = this.size,               
        cutPix = this.cutPix,
        i,                                            
        width = (canvas.width()).toFixed(),
        height = (canvas.height()).toFixed();

    this.paper.setViewBox(0, 0, this.paper.width, this.paper.height); 

    for (i = 0; i <= width; i+=10) {

        this.gridSet.push(this.paper.path('M'+(i*size+cutPix)+', '+0+', L'+(i*size+cutPix)+', '+(size*height)).attr({'stroke-opacity': 0.4}));
    }

    for (i = 0; i <= height; i+=10) {

        this.gridSet.push(this.paper.path('M'+0+', '+(i*size+cutPix)+', L'+(size*width)+', '+(i*size+cutPix)).attr({'stroke-opacity': 0.4}));
    }
};

/**
 * Function that visualizes the scale-figure in the left corner of our grid. 
 * Also adds the components to a set, to have easier access to them.
**/
Grid.prototype.scale = function() {

    var box = this.paper.rect(1, 1, 99, 99).attr({
            'stroke-opacity': 1, 
            'stroke': '#CB2C30', 
            'stroke-width': 3, 
            'fill': 'white', 
            'fill-opacity': 0.7
        }),
        strokeAttr = {
            'stroke-opacity': 1, 
            'stroke': '#CB2C30', 
            'stroke-width': 3, 
            'arrow-start': 'classic-midium-midium',
            'arrow-end': 'classic-midium-midium'
        },
        arrowNW = this.paper.path('M'+0+', '+50+', L'+25+', '+50+'M'+50+', '+25+', L'+50+', '+0).attr(strokeAttr),
        arrowSE = this.paper.path('M'+50+', '+100+', L'+50+', '+75+'M'+75+', '+50+', L'+100+', '+50).attr(strokeAttr),
        tRect = this.paper.rect(30, 40, 40, 20, 5, 5).attr({
            'stroke-width': 0,
            opacity: 1,
            fill: 'white'
        }),
        t = this.paper.text(50, 50, '100 cm');

    this.boxSet.push(box, arrowNW, arrowSE, tRect, t);
};

/**
 * Functionality for zooming on the paper that holds the grid.
 * Source: http://jsfiddle.net/9zu4U/147/
**/
Grid.prototype.zoom = function() {

    /** 
     * Event handler for mouse wheel event.
     */
    function wheel(event) {

        var delta = 0;
        // Indicates that zoom has been 'activated'.
        TFplanner.grid.zoomed = true;

        /* For IE. */
        if (!event) {
            event = window.event;
        }
        /* IE/Opera. */
        if (event.wheelDelta) { 
            delta = event.wheelDelta/120;

        /** Mozilla case. */
        } else if (event.detail) { 
            /** In Mozilla, sign of delta is different than in IE.
            * Also, delta is multiple of 3.
            */
            delta = -event.detail/3;
        }
        /** If delta is nonzero, handle it.
        * Basically, delta is now positive if wheel was scrolled up,
        * and negative, if wheel was scrolled down.
        */
        if (delta) {
            TFplanner.grid.handle(delta);
        }
    
        /** Prevent default actions caused by mouse wheel.
        * That might be ugly, but we handle scrolls somehow
        * anyway, so don't bother here..
        */
        if (event.preventDefault) {
            event.preventDefault();
        }
             
        event.returnValue = false;
    }

    /** Initialization code. 
    * If you use your own event management code, change it as required.
    */
    if (window.addEventListener) {
        /** DOMMouseScroll is for mozilla. */
        window.addEventListener('DOMMouseScroll', wheel, false);
    }
    /** IE/Opera. */
    window.onmousewheel = document.onmousewheel = wheel;


    // Pan functionality bound to arrow keys.
    document.onkeydown = function(e) {

        TFplanner.grid.pan(e.keyCode);
    };
};

/** 
 * This is the function that actually handles the zooming
 * It must react to delta being more/less than zero.
 * @param {int} delta - Wether zoomed in or out
**/
Grid.prototype.handle = function(delta) {
        
    var vB = this.paper._viewBox,
        viewBoxWidth = this.viewBoxWidth,
        viewBoxHeight = this.viewBoxHeight,
        orgX = vB[0],
        orgY = vB[1];

    if (delta > 0) {
        this.viewBoxWidth *= 0.95;
        this.viewBoxHeight*= 0.95;
    } else {
        this.viewBoxWidth *= 1.05;
        this.viewBoxHeight *= 1.05;
    }

    this.paper.setViewBox(orgX, orgY, viewBoxWidth, viewBoxHeight);
};

/** 
 * Function that pans grid (left, right, up, down) on the screen, when 
 * arrow-keys are pressed.
 * @param {int} keycode - Which arrowkey that was pressed.
**/
Grid.prototype.pan = function(keyCode) {

    var ticks = 50,
        vB = this.paper._viewBox;
    // Indicates that zoom or pan has been activated
    TFplanner.grid.zoomed = true;

    switch (keyCode) {
        // Left
        case 37:
            if (vB[0] > 0) {
                this.paper.setViewBox(vB[0] - ticks, vB[1], vB[2], vB[3]);
            }
            break;
        // Up
        case 38:
            if (vB[1] > 0) {
                this.paper.setViewBox(vB[0], vB[1] - ticks, vB[2], vB[3]);
            }
            break;
        // Right
        case 39:
            this.paper.setViewBox(vB[0] + ticks, vB[1], vB[2], vB[3]);
            break;

        // Down
        case 40:
            this.paper.setViewBox(vB[0], vB[1] + ticks, vB[2], vB[3]);
            break;
    }
};

/**
 * Function to find the updated coordinates, 
 * if zoom or pan has been activated
 * @param {int} x - X-coordinate of the mousepointer.
 * @param {int} y - Y-coordinate of the mousepointer.
 * @param {boolean} obst - True if called from obstacles.
 * @return - Returns the coordinates updated with zoom-ratio.
**/
Grid.prototype.getZoomedXY = function(x, y, obst) {

        // Starting height and width
    var sH = this.paper._viewBox[2],
        sW = this.paper._viewBox[3],
        // Original height and width
        oH = this.paper.width,
        oW = this.paper.height,
        // Viewbox X and Y.
        vX = this.paper._viewBox[0],
        vY = this.paper._viewBox[1],
        // Calculated ratio.
        ratio;

    if (sH != oH && sW != oW) {

        ratio = (sH / oH);
        x *= ratio;
        y *= ratio;
    }

    if (!obst) {

        x += vX;
        y += vY;
    }

    return [x, y];
};

/**
 * Function used to move the room to coordinates (99,99). 
 * This happends when the 'obstacles'-tab is clicked.
 * The paths of each wall is updated, also a string is created, 
 * so that the room can be redrawn later as ONE path.
 * @return - Returns the path of our room as one string.
**/
Grid.prototype.moveRoom = function() {

    var minX = 1000000, 
        maxX = 0, 
        minY = 1000000, 
        maxY = 0,
        ns = TFplanner,
        measures = ns.measurement, 
        walls = ns.ourRoom.walls,
        numberOfWalls = walls.length,
        offsetX,
        offsetY,
        xstart,
        ystart,
        tempString,
        pathString,
        path,
        i;

    for (i = 0; i < numberOfWalls; ++i) {
        //Find largest and smallest X value
        if ((walls[i].attrs.path[0][1]) > maxX) {
            maxX = walls[i].attrs.path[0][1];
        }

        if ((walls[i].attrs.path[1][1]) > maxX) {
            maxX = walls[i].attrs.path[1][1];
        }

        if ((walls[i].attrs.path[0][1]) < minX) {
            minX = walls[i].attrs.path[0][1];
        }

        if ((walls[i].attrs.path[1][1]) < minX) {
            minX = walls[i].attrs.path[1][1];
        }

        //Find smallest and largest Y value
        if ((walls[i].attrs.path[0][2]) > maxY) {
            maxY = walls[i].attrs.path[0][2];
        }

        if ((walls[i].attrs.path[1][2]) > maxY) {
            maxY = walls[i].attrs.path[1][2];
        }

        if ((walls[i].attrs.path[0][2]) < minY) {
            minY = walls[i].attrs.path[0][2];
        }

        if ((walls[i].attrs.path[1][2]) < minY) {
            minY = walls[i].attrs.path[1][2];
        }
    } 

    offsetX = minX - 99.5;
    offsetY = minY - 99.5;
    this.resWidth = (maxX - minX);
    this.resHeight = (maxY - minY);
    xstart = (walls[0].attrs.path[0][1] - offsetX);
    ystart = (walls[0].attrs.path[0][2] - offsetY);

    pathString = new String('M '+xstart+', '+ystart);
    
    // Move all the walls to new coordinates (this updates the paths of the real walls)    
    for (i = 0; i < numberOfWalls; ++i) {
        path = walls[i].attr('path');

        path[0][1] = (walls[i].attrs.path[0][1] - offsetX); 
        path[0][2] = (walls[i].attrs.path[0][2] - offsetY);

        path[1][1] = (walls[i].attrs.path[1][1] - offsetX); 
        path[1][2] = (walls[i].attrs.path[1][2] - offsetY); 

        walls[i].attr({path: path});

        tempString = ' L'+path[0][1]+', '+path[0][2];
        pathString += tempString;
    }

    // Refresh the measurement-stuff after moving the walls, 
    //then hide the angles and remove handlers.
    measures.refreshMeasurements();
    measures.finalMeasurements();

    ns.finishedRoom.removeHandlers();

    tempString = ' Z';
    pathString += tempString;

    // Returns the path of our room as ONE string.
    return pathString;
};

/**
 * Function to save our svg-drawing as a .png file.
 * Using libraries published at 'https://code.google.com/p/canvg/' under MIT-license.
 * @param {function} callback - 
**/
Grid.prototype.save = function(callback) {

    var ns = TFplanner,
        chosenMats,
        footM = ns.footmenu,
        matTypes,
        mats = [],
        tmp = null,
        name = null,
        chosenMat = null,
        desc,
        note = null;

        /**
         * Sets up the paper for svg convertion, converts and returns svg.
         * Adding 201 which represents the 1 meter offset + the 1 pixel offset that shows the grid outlines.
         * @param theGrid - The Grid object, refered to as 'this' in save().
         * @return - Calls function to generate SVG of our paper-elements.
        **/
        setupPaper = function (theGrid) {
            // Sets width and height of the svg so to appropriate size for export.
            theGrid.paper.width = (theGrid.resWidth + 201);
            theGrid.paper.height = (theGrid.resHeight + 201);
            return theGrid.paper.toSVG();
        },
        /**
         * Post svg and table html to php script that creates a page to be exported as pdf.
        **/  
        saveSVG = function () {

            $.post(
                'export/saveSVG.php', 
                {
                    'svg': svg,
                    'mats': tableString, 
                    'note': note
                }, 
                function (data) {
                    footM.drawId = data;
                    callback();
                }
            );
        },
        svg = setupPaper(this),
        tableString = null;


    // Store generated svg to footmenu variable.
    footM.svg = svg;

    // Check if resultgrid exists. if it does save the variables
    if (ns.resultGrid != null) {
        chosenMats = ns.resultGrid.chosenMats;
        matTypes = ns.options.validMat.products;
        desc = ns.options.validMat.desc;
        note = ns.options.validMat.note;

    // else save the svg only, then return/quit function.
    } else {
        saveSVG();
        return;
    }

    // Create table of chosen mats and attributes.
    // Decide mat amounts and info by going through chosen mats.
    for (var i = 0, ii = chosenMats.length; i < ii; i++) {
        // Store mat (productnumber).
        chosenMat = chosenMats[i];

        // If mat already counted
        if (chosenMat == tmp) {

            mats[(mats.length - 1)][2]++;
        // Else mat needs to be counted/ sat.
        } else {

            // Getting productname
            for (var j = 0, jj = matTypes.length; j < jj; j++) {

                if (matTypes[j].number == chosenMat) {
                    name = matTypes[j].name;
                }
            }

            mats.push([chosenMat, name, 1]);
        }
        tmp = chosenMat;
    }

    // Setting the initial content of tableString. Table and its headers with a class added to the ANTALL column header and an id to the table tag.
    tableString = '<table id="matTable"><tr><th>EL-NUMMER</th><th>PRODUKTBESKRIVELSE</th><th>PRODUKT</th><th class="amount">ANTALL</th></tr>';

    // Going through mats array, adding each of the variables to the tableString representing a row.
    for (var i = 0, ii = mats.length; i < ii; i++) {

        tableString += '<tr><td>'+mats[i][0]+'</td><td>'+desc+'</td><td>'+mats[i][1]+'</td><td class="amount">'+mats[i][2]+'</td></tr>';
    }

    // Adding the endtag of the table.
    tableString += '</table>';
};

/**
 * @class Holds handlers and functionality needed for a finished room
**/
function FinishedRoom() {
    this.walls;
    this.undoSet = TFplanner.grid.paper.set();
}

FinishedRoom.prototype.radius = 20;
FinishedRoom.prototype.handle = null;
FinishedRoom.prototype.pathHandle = null;
FinishedRoom.prototype.hoverWall = null;
FinishedRoom.prototype.selectedWall = null;
// Shortcut for Norwegian characters
FinishedRoom.prototype.dotA = String.fromCharCode(229);
FinishedRoom.prototype.crossO = String.fromCharCode(248);

/**
 * Function that calls the 'add-handlers'-functionality, and shows the correct tab when
 * a room is drawn. (Obstacles-tab when the room is 'selfDrawn', Define-tab when a pre-made 
 * room is created)
**/
FinishedRoom.prototype.addWalls = function() {

    var theRoom = TFplanner.ourRoom;

    this.walls = theRoom.walls;
    this.clickableCorners();
    this.setHandlers();

    if (theRoom.selfDrawn === false) {
        TFplanner.options.showOptions(4);
    }
};

/**
 * Called when we have targeted a wall. Used to find the 'neighbour-walls' 
 * of our target, so they follow the dragged wall.
 * @param {path} wMatch - The targeted wall
**/
FinishedRoom.prototype.clickableWalls = function(wMatch) {

    var thisWall = wMatch,
        prevWall = null,
        nextWall = null;

    for (var i = 0, ii = this.walls.length; i < ii; i++) {

        // When wall number 'i' is the same as our targeted wall, we can easily find the two walls
        // connected to it. (Some special-cases when we have targeted the first or the last wall in the array)
        if (this.walls[i] == thisWall) {
            prevWall = (this.walls[i-1] != null) ? this.walls[i-1] : this.walls[ii-1];
            nextWall = (this.walls[i+1] != null) ? this.walls[i+1] : this.walls[0];
        }            
    }
    // If we not already have targeted a wall or a corner, we can select the wanted one.
    if (this.pathHandle === null && this.handle === null) {
        this.clickableWall(prevWall, thisWall, nextWall);
    }
};

/**
 * Function that selects the wall by changing its appearance.
 * If no parameter is sent, deselect all.
 * @param {int} index - Index of the targeted wall
**/
FinishedRoom.prototype.selectWall = function(index) {

    // Remove old selelectedwall if it exists.
    if (this.selectedWall) {
        this.selectedWall.remove();
    }

    if (index != null) {
        this.selectedWall = TFplanner.grid.paper.path(this.walls[index].attrs.path).attr({
            stroke: '#3366FF',
            'stroke-width': this.radius,
            'stroke-opacity': 0.5, 
            'stroke-linecap': 'butt'
        });
    }
};

/**
 * Function that adds drag and drop functionality to the targeted
 * wall and its two neighbour-walls.
 * @param {path} prev - The wall "before" the targeted in the array.
 * @param {path} current - The targeted wall.
 * @param {path} next - The "next" wall of the targeted.
**/
FinishedRoom.prototype.clickableWall = function(prev, current, next) {

    var room = this,
        prevWall = prev,
        thisWall = current,
        nextWall = next,
        dotA = this.dotA,
        theGrid = TFplanner.grid,
        measures = TFplanner.measurement,
        pathArray1 = prevWall.attr('path'),
        pathArray2 = thisWall.attr('path'),
        pathArray3 = nextWall.attr('path'),

        // Copy the content of the wall-elements
        w1 = $.extend(true, {}, prevWall),
        w2 = $.extend(true, {}, thisWall),
        w3 = $.extend(true, {}, nextWall);

    // This will clear the 'undo-set' if it already contains anything.
    if (this.undoSet.length > 0) {
        this.undoSet.clear();
    }
    // Push copies of the targeted walls to the undo-set.
    this.undoSet.push(w1, w2, w3);

    // Handler used so we easily can target and drag a wall.
    this.pathHandle = theGrid.paper.path(thisWall.attrs.path).attr({
        stroke: '#3366FF',
        'stroke-width': room.radius,
        'stroke-opacity': 0.5, 
        'stroke-linecap': 'butt',
        cursor: 'move',
        title: 'Hold museknapp inne og dra for '+dotA+' flytte vegg'
    });
   
    var start = function() {

        // Figure out if the wall is horizontal or vertical
        var wall = thisWall.attrs.path,
            p1x = wall[0][1],
            p1y = wall[0][2], 
            p2x = wall[1][1],
            p2y = wall[1][2],
            diffpx = (p1x - p2x),
            diffpy = (p1y - p2y);

            this.startTime = Date.now();
            this.latency = TFplanner.latency;

        diffpx = (diffpx < 0) ? (diffpx * -1) : diffpx;
        diffpy = (diffpy < 0) ? (diffpy * -1) : diffpy;

        this.horizontally = (diffpx <= diffpy) ? true : false;

    },

    /**
     *  Only moves the walls every 50ms, to ensure that the browser is not overloaded with mousemovements.
    **/
    move = function(dx, dy) {

        var nowTime = Date.now(),
            timeDiff = (nowTime - this.startTime),
            xy,
            diffx,
            diffy;

        if (timeDiff > this.latency) {

            xy = (!theGrid.zoomed) ? [dx, dy] : theGrid.getZoomedXY(dx, dy);
            // Setting diffx or diffy to 0 based on the horizontal bool or if lastdx/y is null.
            diffx = (this.lastdx != null) ? (this.horizontally) ? (this.lastdx - xy[0]) : 0 : 0;
            diffy = (this.lastdy != null) ? (!this.horizontally) ? (this.lastdy - xy[1]) : 0 : 0;

            this.lastdx = xy[0];
            this.lastdy = xy[1];

            // Changing values of the end of the wall 'before' the target-wall.
            pathArray1[1][1] -= diffx;
            pathArray1[1][2] -= diffy;

            // Changing values of both ends of our dragged target.
            pathArray2[0][1] -= diffx;
            pathArray2[0][2] -= diffy;
            pathArray2[1][1] -= diffx;
            pathArray2[1][2] -= diffy;

            // Changing values of the wall 'after' our target-wall.
            pathArray3[0][1] -= diffx;
            pathArray3[0][2] -= diffy;
            
            // Updating the attributes of the three walls, so they are redrawn as they are dragged.
            prevWall.attr({path: pathArray1});
            thisWall.attr({path: pathArray2});
            nextWall.attr({path: pathArray3});
            this.attr({path: pathArray2});

            measures.refreshMeasurements();
            this.startTime = nowTime;
        }
    },

    up = function() {
        // Clear variables and delete the handler on mouseup.
        measures.refreshMeasurements();

        this.lastdx = this.lastdy = 0;
        this.remove();
        room.nullify(); 
    };

    room.pathHandle.drag(move, start, up);
};


/**
 * Functionality for adding mouse-handlers to all the walls. 
 * Called when the 'finishRoom'-variable is set.
**/
FinishedRoom.prototype.setHandlers = function() {

    var room = this,
        theRoom = TFplanner.ourRoom,
        dotA = this.dotA;

    // Looping through the set of walls, and adding handlers to all of them.
    this.walls.forEach(function(element) {

        element.mousedown(function() {
            room.clickableWalls(this);
        });

        element.hover(function () {
            // Do not visualize the mouseovered wall, if an other wall or corner is targeted.
            if (room.handle === null && theRoom.tmpCircle === null && room.pathHandle === null) {
                room.hoverWall = true;
                this.attr({
                    stroke: '#008000',            
                    'stroke-width': room.radius,
                    'stroke-opacity': 0.5,
                    'stroke-linecap': 'butt',
                    cursor: 'pointer',
                    title: 'Klikk for '+dotA+' velge vegg'  
                });
            }
        }, function () {
            room.hoverWall = null;
            this.attr({
                stroke: '#2F4F4F',
                'stroke-width': 5,
                'stroke-linecap': 'square',
                'stroke-opacity': 1,
                cursor: 'default'
            });
        });
    });
    
    // Bind Undo-action (Ctrl+Z)
    $(document).keydown(function(e) {
        if (e.which == 90 && e.ctrlKey === true) {
            room.undo();
        }
    });
};

/**
 * Function to handle 'Undo'-functionality. Only possible to go ONE step back, by using 'ctrl+z'.
 * Works if the user have dragged a corner, or a wall.
**/
FinishedRoom.prototype.undo = function() {

    var theRoom = TFplanner.ourRoom,
        measures = TFplanner.measurement;

    // This is used specially when dragging of a wall has happend (3 items in the undo-set).
    if (this.undoSet.length == 3) {
        
        for (var i = 0, ii = this.walls.length; i < ii; i++) {

            if (this.undoSet[1].id == theRoom.walls[i].id && i > 0 && i != this.walls.length-1) {
               theRoom.walls[i-1].attr({path: this.undoSet[0].attrs.path});
               theRoom.walls[i].attr({path: this.undoSet[1].attrs.path});
               theRoom.walls[i+1].attr({path: this.undoSet[2].attrs.path});
               measures.refreshMeasurements();
               this.undoSet.clear();
               return;
            // Wall number 'zero' was dragged:
            } else if (this.undoSet[1].id == theRoom.walls[i].id && i === 0) {
               theRoom.walls[this.walls.length-1].attr({path: this.undoSet[0].attrs.path});
               theRoom.walls[i].attr({path: this.undoSet[1].attrs.path});
               theRoom.walls[i+1].attr({path: this.undoSet[2].attrs.path});
               measures.refreshMeasurements();
               this.undoSet.clear();
               return;
            // The 'last wall' in the array was dragged.
            } else if (this.undoSet[1].id == theRoom.walls[i].id && i == this.walls.length-1) {
               theRoom.walls[this.walls.length-2].attr({path: this.undoSet[0].attrs.path});
               theRoom.walls[i].attr({path: this.undoSet[1].attrs.path});
               theRoom.walls[0].attr({path: this.undoSet[2].attrs.path});
               measures.refreshMeasurements();
               this.undoSet.clear();
               return;
            }
        }
    } else if (this.undoSet.length == 2) {

        for (var i = 0, ii = this.walls.length; i < ii; i++) {

            if (this.undoSet[0].id == theRoom.walls[i].id) {
                theRoom.walls[i].attr({path: this.undoSet[0].attrs.path});
                
            } else if (this.undoSet[1].id == theRoom.walls[i].id) {
                theRoom.walls[i].attr({path: this.undoSet[1].attrs.path});
            }
        }
        measures.refreshMeasurements();
        this.undoSet.clear();
    }
};

/**
 * Function to disable/remove all handlers for a finished room. 
 * Dragging and stuff will not be possible after this function is executed.
**/
FinishedRoom.prototype.removeHandlers = function() {

    // Looping through the set of walls, and unbind all the handlers.
    this.walls.forEach(function(element) {
        element.unmousedown();
        element.unhover();
    });
    // And removing handlers for the corner-dragging.
    $('#canvas_container').unbind('mousedown');
    $('#canvas_container').unbind('mousemove');
    $(document).unbind('keydown');

    this.nullify();
};

/**
 * Binds action listeners to mouseclick and movement, 
 * especially for moving corners and walls.
**/
FinishedRoom.prototype.clickableCorners = function() {

    var room = this,
        theRoom = TFplanner.ourRoom,
        match,

        /**
         * Checks if two walls is connected nearby the mousecoordinate.
         * @param e - The mouseevent to check out.
         * @return a point where to walls is connected, or null
        **/
        checkMatch = function(e) {
            var point = theRoom.crossBrowserXY(e);

            return ((point !== null) ? theRoom.findCorner(point) : null);
        };

    $('#canvas_container').mousedown(function(e) {
        if ((match = checkMatch(e)) !== null) {
            room.dragCorner(match);
        }
    });

    // Binds action for mouseover, specifically for showing temp shit
    $('#canvas_container').mousemove(function(e) {
        // No need to draw the circle if a corner or a wall already is targeted.
        if ((match = checkMatch(e)) !== null && room.handle === null && room.pathHandle === null && room.hoverWall === null) {
            theRoom.visualizeRoomEnd(match);

        } else if (theRoom.tmpCircle) {
            theRoom.tmpCircle.remove();
            theRoom.tmpCircle = null;
        } 
    });
};

/**
 * Functionality that finds which walls that should be
 * moved when a corner is mouseovered.
 * @param {Point} point - The corner where the mouse was clicked
**/
FinishedRoom.prototype.dragCorner = function(point) {

    var match = point,
        indexArr = [],
        tmpSPx,
        tmpSPy, 
        tmpEPx,
        tmpEPy,
        tmpWall,
        x = match[0], 
        y = match[1];

    for (var i = 0, ii = this.walls.length; i < ii; i++) {

        tmpWall = this.walls[i];

        tmpSPx = tmpWall.attrs.path[0][1];
        tmpSPy = tmpWall.attrs.path[0][2];
        tmpEPx = tmpWall.attrs.path[1][1];
        tmpEPy = tmpWall.attrs.path[1][2];

        if (x == tmpSPx && y == tmpSPy) {
            indexArr.push([i, 0]);

        } else if (x == tmpEPx && y == tmpEPy) {
            indexArr.push([i, 1]);
        }
    }

    if (indexArr.length > 1 && this.handle === null && this.pathHandle === null) {
        this.drag(indexArr, match);
    }
};

/**
 * Function for adding drag-functionality to a corner (point where two
 * walls is connected in a finished room).
 * If the path1Order is 0, this means that the startpoint of the wall is about
 * to be changed. If it is 1, the endpoint of the wall will be changed.
 * The same applies to path2Order.
 * @param {Point} match - The coordinate of the mouseposition, used when
 * visualizing the circle.
 * @param {int} indexArr - Index of which walls that should have their
 * path updated.
**/
FinishedRoom.prototype.drag = function(indexArr, match) {

    var path1 = this.walls[indexArr[0][0]],
        path2 = this.walls[indexArr[1][0]],
        path1Order = indexArr[0][1],
        path2Order = indexArr[1][1],    
        pathArray1 = path1.attr('path'),
        pathArray2 = path2.attr('path'),
        dotA = this.dotA,
        crossO = this.crossO,
        theGrid = TFplanner.grid,
        measures = TFplanner.measurement,
        room = this,
        w1 = $.extend(true, {}, path1),
        w2 = $.extend(true, {}, path2);

    // If something already is stored in the undo-set, we have to clear it.
    if (this.undoSet.length > 0) {
        this.undoSet.clear();
    }
    // The pushed walls are copies, not the actual ones.
    this.undoSet.push(w1, w2);

    // Draw the circle that can be targeted.
    this.handle = theGrid.paper.circle(match[0], match[1], this.radius).attr({
        fill: '#3366FF',
        'fill-opacity': 0.5,
        'stroke-opacity': 0.5,
        cursor: 'move',
        title: 'Hold inne museknapp og dra for '+dotA+' flytte hj'+crossO+'rnet'
    });

    var start = function() {

        this.cx = 0;
        this.cy = 0;
        this.startTime = Date.now();
        this.latency = TFplanner.latency;
    },

    move = function(dx, dy) {

        // Updating measurements every 50 ms
        var nowTime = Date.now(),
            timeDiff = (nowTime - this.startTime),
            xy,
            diffx,
            diffy,
            X, Y;

        if (timeDiff > this.latency) {
            // No need to call for zoom-values, if zoom is not done.
            xy = (!theGrid.zoomed) ? [dx, dy] : theGrid.getZoomedXY(dx, dy);
            // Calculating the difference from last mouse position.
            diffx = (this.lastx !== undefined) ? (this.lastx - xy[0]) : 0;
            diffy = (this.lasty !== undefined) ? (this.lasty - xy[1]) : 0;

            // Calculating the new handle coordinates.
            X = this.attr('cx') - diffx;
            Y = this.attr('cy') - diffy;

            // Storing the last mouse position.
            this.lastx = xy[0];
            this.lasty = xy[1];

            // Updating the handle position
            this.attr({cx: X, cy: Y});

            // Updating the connecting path arrays.
            if (path1Order === 0) {
               pathArray1[0][1] -= diffx;
               pathArray1[0][2] -= diffy;
            } else {
               pathArray1[1][1] -= diffx;
               pathArray1[1][2] -= diffy;
            }

            if (path2Order === 0) {
               pathArray2[0][1] -= diffx;
               pathArray2[0][2] -= diffy;
            } else {
               pathArray2[1][1] -= diffx;
               pathArray2[1][2] -= diffy;
            }

            // Setting the new path arrays.
            path1.attr({path: pathArray1});
            path2.attr({path: pathArray2});

            measures.refreshMeasurements();
            this.startTime = nowTime;
        }
    },

    // Do some cleaning and nullifying on mouseUp.
    up = function() {

        measures.refreshMeasurements();

        this.dx = this.dy = 0;
        this.remove();
        room.nullify();           
    };

    this.handle.drag(move, start, up);
};

/**
 * Function to makes sure our handlers and draggables
 * are cleared, and nullified.
**/
FinishedRoom.prototype.nullify = function() {

    if (this.handle) {
        this.handle.remove();
        this.handle = null;

    } else if (this.pathHandle) {
        this.pathHandle.remove();
        this.pathHandle = null;
    }
};


/**
 * @class Holds the functionality to draw a room from scratch
 * @param {int} radius - Decides the radius of the wall-end forcefield
**/
function DrawRoom(radius) {
    this.radius = radius;
    this.walls = TFplanner.grid.paper.set();
}

DrawRoom.prototype.lastPoint = null;
DrawRoom.prototype.tmpWall = null;
DrawRoom.prototype.tmpLen = null;
DrawRoom.prototype.tmpRect = null;
DrawRoom.prototype.tmpCircle = null;
DrawRoom.prototype.proximity = false;
DrawRoom.prototype.invalid = false;
DrawRoom.prototype.finished = false;
DrawRoom.prototype.xAligned = false;
DrawRoom.prototype.yAligned = false;
DrawRoom.prototype.minAngle = 29.95;
DrawRoom.prototype.maxAngle = 330.05;
DrawRoom.prototype.minLength = 50;
DrawRoom.prototype.selfDrawn = true;
DrawRoom.prototype.startTime = Date.now();

/**
 * Function that initiates drawing of a room.
**/
DrawRoom.prototype.initRoom = function() {

    var room = this,
        latency = TFplanner.latency,
        point;

    // Binds action for mousedown.
    $('#canvas_container').click(room, function(e) {

        point = room.crossBrowserXY(e);

        // Return if point is null or the target nodename is "tspan".
        // This fixes coordinate bugs.
        if (point === null || e.target.nodeName == 'tspan') {
            return;
        }

        (room.lastPoint === null) ? room.lastPoint = point : room.wallEnd(point);
    });

    // Binds action for mouseover, specifically for showing temp-stuff.
    $('#canvas_container').mousemove(room, function(e) {

        var nowTime = Date.now(),
            timeDiff = (nowTime - room.startTime);

        // Only invoke action on mousemove given time limit is met.
        if (timeDiff > latency) {

            point = room.crossBrowserXY(e);

            // Return if point is null or the target nodename is "tspan",
            // for fixing coordinate-bugs.
            if (point === null || e.target.nodeName == 'tspan') {
                return;
            } 
            // Draws the templine and shows the length of it.
            if (room.lastPoint !== null && point !== null && room.lastPoint != point) {
                
                room.drawTempLine(point);
            }
            room.startTime = nowTime;
        }
    });
};

/**
 * Function that goes through our wall array and finds two points that are the same.
 * @param {Point} point - A mousecoordinate that will be checked against our walls.
 * @return A point where two walls connect, null if no match.
**/
DrawRoom.prototype.findCorner = function(point) {

    var start,
        end;

    for (var i = 0, ii = this.walls.length; i < ii; i++) {

        start = [this.walls[i].attrs.path[0][1], this.walls[i].attrs.path[0][2]];
        end = [this.walls[i].attrs.path[1][1], this.walls[i].attrs.path[1][2]];

        if (this.isProximity(point, start)) {
            return start;

        } else if (this.isProximity(point, end)) {
            return end;
        }
    }

    return null;
};

/**
 * Function handling the logic for autocompleting a room, and calls the drawing of a
 * wall in any cases, even if no autocompletion should be done.
 * @param {Point} point - The point/coordinate the mouse was clicked, and the end of the wall
 * should be drawn to.
**/
DrawRoom.prototype.wallEnd = function(point) {

    var newStart = this.lastPoint,
        newEnd = point,
        initPoint = null;

    // Check that the points are not the same, and if the line is < 30degress (invalid)
    // If it is: return from function.
    if ((newStart.x == newEnd.x && newStart.y == newEnd.y) || this.invalid) {
        return;
    }

    // If there are two or more walls, allow for room completion.
    if (this.walls.length > 1) {
        // Get the startingpoint of the first wall.
        initPoint = [this.walls[0].attrs.path[0][1], this.walls[0].attrs.path[0][2]];
        // Checks if we are in the area of auto-completion of the room. (Could use a failsafe in case
        // initPoint is null.
        if (this.proximity || (newEnd.x == initPoint[0] && newEnd.y == initPoint[1])) {
            newEnd.x = initPoint[0];
            newEnd.y = initPoint[1];
            
            if (this.tmpCircle !== null) {
                this.tmpCircle.remove();
            }
            // Set room to finished.
            this.finished = true;
        }
    }

    // If no returns has occured, we want to draw the wall, and update the last point.
    this.lastPoint = newEnd;
    this.drawWall(newStart, newEnd);
};

/** 
 * Function that checks if the ending point is in the vincinity of the initial point of the room.
 * @param {Point} point1 - Position of the mouse.
 * @param {Point} point2 - Coordinates of the wall-start/wall-end
 * @return 'True' if the point is near the initial point, else 'False'.
**/
DrawRoom.prototype.isProximity = function(point1, point2) {

    var initPointX,
        initPointY; 

    // No need to check the length if point1 is undefined. (Might occur over text at the grid)
    if (point1 === undefined) {
        return;
    }
    // Sets the X and Y values for the initpoint. This will be startpoints of wall[0] if
    // point2 is not sent as parameter to function.
    initPointX = (point2 === undefined) ? this.walls[0].attrs.path[0][1] : point2[0];
    initPointY = (point2 === undefined) ? this.walls[0].attrs.path[0][2] : point2[1]; 

    testLength = this.vectorLength(initPointX, initPointY, point1.x, point1.y);

    return (testLength <= this.radius);
};

/**
 * Function that draws a wall based on the coordinates of
 * two clicked mousepoints.
 * @param {Point} point1 - Startpoint of the wall to be drawn.
 * @param {Point} point2 - Endpoint of the same wall.
**/
DrawRoom.prototype.drawWall = function(point1, point2) {

    var ns = TFplanner,

        /**
         * Function that unbinds mouseactions related to drawing of a room,
         * Only called when the room is 'completed'.
        **/
        finishRoom = function() {

            $('#canvas_container').unbind('click');
            $('#canvas_container').unbind('mousemove');

            if (ns.finishedRoom === null) {
                ns.finishedRoom = new FinishedRoom();
            }

            ns.finishedRoom.addWalls();
        };
        

    // Checking if x or y is set to aligned
    point2.x = (this.xAligned && !this.proximity) ? point1.x : point2.x;
    point2.y = (this.yAligned && !this.proximity) ? point1.y : point2.y;

    // We might need to clean up some of the temporary-stuff.
    if (this.tmpWall) {
        this.clearTmp();
    }
    // Push the new wall to the walls-array.
    this.walls.push(ns.grid.paper.path('M'+point1.x+','+point1.y+' L'+point2.x+','+point2.y).attr({ 
        stroke: '#2F4F4F',
        'stroke-width': 5,
        'stroke-linecap': 'round'
    }));

    ns.measurement.refreshMeasurements();

    if (this.finished) {
        finishRoom();
    }
};

/**
 * Visualization of the line that the user is about to draw, and the length of the line.
 * This line will not be saved in our array.
 * @param {Point} point - Coordinate of the mouseposition at this moment.
 * @return the tmpWall that is drawn.
**/
DrawRoom.prototype.drawTempLine = function(point) {

    var p2 = point,
        p1 = this.lastPoint,
        tmpLen,
        theGrid = TFplanner.grid,
        measures = TFplanner.measurement,
        diffX, 
        diffY,
        tmpMultiplier = 0.05,
        walls = this.walls,
        crossed = false,
        x1 = null,
        y1 = null,
        tmpAngle,
        tmpBool,

        // TODO: This might need some more comments and cleaning
        /**
         * Heavy function that checks if the drawn line will cross an other wall in the room.
         * Source: http://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
         * @param x1 -
         * @param x2 -
         * @param x3 -
         * @param x4 -
         * @return 'True' if the line crosses an other line, 'False' if not.
        **/
        wallCross = function(x1, y1, x2, y2) {

            var x, 
                y, 
                x3,
                y3, 
                y4, 
                x4,
                tmpWall,
                crossed;

            for (var i = 0, wallCount = (walls.length-1); i < wallCount; i++) {

                crossed = true;
                tmpWall = walls[i];
                x3 = tmpWall.attrs.path[0][1];
                y3 = tmpWall.attrs.path[0][2];
                x4 = tmpWall.attrs.path[1][1];
                y4 = tmpWall.attrs.path[1][2];

                x = ((x1*y2-y1*x2) * (x3-x4)-(x1-x2) * (x3*y4-y3*x4)) / ((x1-x2) * (y3-y4) - (y1-y2) * (x3-x4));
                y = ((x1*y2-y1*x2) * (y3-y4)-(y1-y2) * (x3*y4-y3*x4)) / ((x1-x2) * (y3-y4) - (y1-y2) * (x3-x4));

                if (isNaN(x) || isNaN(y)) {
                    crossed = false;
                
                } else {

                    // if startpoint.x > endpoint.x
                    if (x1 >= x2) {
                        if (!(x2 <= x && x <= x1)) {
                            crossed = false;
                        }
                    //
                    } else {
                        if (!(x1 <= x && x <= x2)) {
                            crossed = false;
                        }
                    }
                    // 
                    if (y1 >= y2) {
                        if (!(y2 <= y && y <= y1)) {
                            crossed = false;
                        }
                    //
                    } else {
                        if (!(y1 <= y && y <= y2)) {
                            crossed = false;
                        }
                    }
                    //
                    if (x3 >= x4) {
                        if (!(x4 <= x && x <= x3)) {
                            crossed = false;
                        }
                    //
                    } else {
                        if (!(x3 <= x && x <= x4)) {
                            crossed = false;
                        }
                    }
                    //
                    if (y3 >= y4) {
                        if (!(y4 <= y && y <= y3)) {
                            crossed = false;
                        }
                    // 
                    } else {
                        if (!(y3 <= y && y <= y4)) {
                            crossed = false;
                        }
                    }
                }

                if (crossed) {
                    return true;
                }
            }
            return crossed;
        },

        /**
         * Function that display the length of a wall that is being drawn
         * at all times when the mouse is moved around.
         * @param tmpWall - The drawn temporary-wall, to show the length of.
        **/
        tmpLength = function (tmpWall) {

            var theGrid = TFplanner.grid,
                theRoom = TFplanner.ourRoom,
                /**
                 *  Funcitonality replacing "tmpWall.getPointAtLength((tmpWall.getTotalLength()/2))".
                 *  Using the previous functionality drastically slowed down performance in FF.
                **/
                middle = function(line) {

                    var x1 = line.attrs.path[0][1],
                        y1 = line.attrs.path[0][2],
                        x2 = line.attrs.path[1][1], 
                        y2 = line.attrs.path[1][2],

                        x = ((x1 + x2) / 2),
                        y = ((y1 + y2) / 2);

                    return {x: x, y: y};
                },
                textPoint = middle(tmpWall),
                len = (tmpWall.getTotalLength() / 100);
                len = len.toFixed(2);

            // Draws a rectangle, where the length can be displayed.
            if (theRoom.tmpRect === null) {
                theRoom.tmpRect = theGrid.paper.rect(textPoint.x-25, textPoint.y-10, 50, 20, 5, 5).attr({
                    opacity: 1,
                    fill: 'white'
                });

            // If the rectangle already exists, we only update its position.
            } else {
                theRoom.tmpRect.attr({
                    x: textPoint.x-25,
                    y: textPoint.y-10,
                });
            }

            // Create the text-element that show the length of the wall.
            if (theRoom.tmpLen === null) {
                theRoom.tmpLen = theGrid.paper.text(textPoint.x, textPoint.y, len + ' m').attr({
                    opacity: 1,
                    'font-size': 12,
                    'font-family': 'verdana',
                    'font-style': 'oblique'
                });

            // If the text-element already exist, we just update the position and the text.
            } else {
                theRoom.tmpLen.attr({
                    x: textPoint.x,
                    y: textPoint.y,
                    text: len + ' m' 
               });
            }
        };


    if (this.walls.length > 1) {

        // Store x and y for the starting point of first wall.
        // used further down the line.
        x1 = walls[0].attrs.path[0][1];
        y1 = walls[0].attrs.path[0][2];

        // Logic for checking if the second wall crosses:
        crossed = wallCross(p1.x, p1.y, p2.x, p2.y) ? true : false;

        // See if we are in the area where the room gets 'auto-completed'.
        // Set ending point (p2) to the starting point of wall[0].
        if (this.isProximity(p2)) {
            this.visualizeRoomEnd();
            p2.x = x1;
            p2.y = y1;
            this.proximity = true;

        } else {
            if (this.tmpCircle !== null) {
                this.tmpCircle.remove();
            }
            this.proximity = false;
        } 
    }

    // Forcing 90 degree angles!
    tmpLen = this.vectorLength(p1.x, p1.y, p2.x, p2.y);

    diffX = (p1.x >= p2.x) ? (p1.x - p2.x) : (p2.x - p1.x);
    diffY = (p1.y >= p2.y) ? (p1.y - p2.y) : (p2.y - p1.y);

    if (!this.proximity) {
        // Checking if x value is in range
        if (diffX < (tmpLen * tmpMultiplier)) {
            p2.x = p1.x;
            this.xAligned = true;

        // Checking if y value is in range.
        } else if (diffY < (tmpLen * tmpMultiplier)) {
            p2.y = p1.y;
            this.yAligned = true;

        // Set both alignements to false.
        } else {
            this.xAligned = false;
            this.yAligned = false;
        }
    }

    // Three steps:
    // 1: If the tmpWall is 'null' we draw it, if it already exist we just change the attributes.
    // 2: deciding to color the tmpline red/black based on if it crosses another,
    // and if it is the same as the starting point of the first wall.
    // 3: assigning "this.crossed" to false/true based on the above. used in endWall().
    if (crossed && !(x1 == p2.x && y1 == p2.y)) {

        if (this.tmpWall === null) {
            this.tmpWall = theGrid.paper.path('M'+p1.x+','+p1.y+' L'+p2.x+','+p2.y);
        }

        this.tmpWall.attr({
            path: ['M'+p1.x+','+p1.y+' L'+p2.x+','+p2.y],
            stroke: '#ff0000'
        });

    } else if (this.tmpWall === null) {
        this.tmpWall = theGrid.paper.path('M'+p1.x+','+p1.y+' L'+p2.x+','+p2.y);

    } else {
        this.tmpWall.attr({
            path: ['M'+p1.x+','+p1.y+' L'+p2.x+','+p2.y],
            stroke: '#000000'
        });
    }

    // Show the angle of the temporary wall (angle to previous drawn wall).
    // Check if there are walls in the first place, then check if the wall is longer than this.radius*2.
    var tmpWallLen = this.tmpWall.getTotalLength(),
        rad = (this.radius * 2);

    if (this.walls.length >= 1 && (tmpWallLen > rad)) {
        // Store temporary angle in measurements
        tmpAngle = measures.angleMeasurement(null, this.tmpWall);

        // Store tmpBool as false (meaning it is valid).
        tmpBool = false;

        // Check if angle is smaller than 30 and larger than 330 degrees, and if the wall is < 50cm.
        // If this is true, change the color to  red (like when crossed);
        if (tmpAngle > this.maxAngle || tmpAngle < this.minAngle || tmpLen < this.minLength) {
            this.tmpWall.attr({
                stroke: '#ff0000'
            });
            tmpBool = true;
        }

        this.invalid = (crossed) ? crossed : tmpBool;

    } else if (measures.tmpAngle != null) {
        measures.tmpAngle[1].remove();
        measures.tmpAngle[2].remove();
        measures.tmpAngle = null;
    }

    tmpLength(this.tmpWall);
};

/**
 * When the user draws a wall that the 'isProximity' is going to auto-complete, we
 * will visualize that the wall is in the range for this to happen by drawing a circle.
 * @param {Point} p - the point that the tmpCircle is based on.
**/
DrawRoom.prototype.visualizeRoomEnd = function(p) {
   
    var point = (p === undefined) ? [this.walls[0].attrs.path[0][1], this.walls[0].attrs.path[0][2]] : p,
        doCircle = (this.tmpCircle === null) ? true : (this.tmpCircle[0] === null);

    if (doCircle) {
        this.tmpCircle = TFplanner.grid.paper.circle(point[0], point[1], this.radius, 0, 2 * Math.PI, false).attr({
            fill: '#008000',
            'fill-opacity': 0.5,
            'stroke-opacity': 0.5
        });

    } else {
        this.tmpCircle.attr({
            path: [point[0], point[1]]
        });
    }
};

/**
 * Some browser does not set the offsetX and offsetY variables on mouseclicks,
 * so a workaround is needed.
 * @param {Event} e - The MouseEvent that occured in the browser
 * @return - Coordinate in the grid, null if pointer is outside the viewbox.
**/
DrawRoom.prototype.crossBrowserXY = function(e) {

    var theGrid = TFplanner.grid,
        e = e || window.event,
        vB = theGrid.paper._viewBox,

        /**
         * Makes sure that the user can`t draw in the left corner, where the 'scale' is placed.
         * @param xy - The position of the mouse, that holds an x- and y-value.
         * @return - If the coordinate is in the area of the 'scale' in left corner, return (-1, -1)
        **/
        getRestriction = function(xy) {

            var x = xy[0],
                y = xy[1];

            return (!(x < 100 && y < 100)) ? {x: x, y: y} : {x: -1, y: -1};
        },

        // In FF offsetX is undefined, so then we need to handle the coordinates in a different way.
        x = (e.offsetX !== undefined) ? e.offsetX : (e.pageX - e.currentTarget.offsetLeft),
        y = (e.offsetY !== undefined) ? e.offsetY : e.clientY,

        // If zoom is activated, we must get the zoomed coordinates, 'zoomed' in our Grid is TRUE if
        // zoom has been used.
        point = (!theGrid.zoomed) ? getRestriction([x, y]) : getRestriction(theGrid.getZoomedXY(x, y));

    // Preventing a bug that makes you draw outside the viewbox.
    if ((point.x < vB[0] || point.y < vB[1]) || (point.x < 0 || point.y < 0)) {
        return null;
        
    } else {
        return point;
    }
};

/**
 * Function that calculates the vector length between two points.
 * @param {int} x1 - X-coordinate of point 1
 * @param {int} y1 - Y-coordinate of point 1
 * @param {int} x2 - X-coordinate of point 2
 * @param {int} y2 - Y-coordinate of point 2
 * @return The calculated length between the points
**/
DrawRoom.prototype.vectorLength = function(x1, y1, x2, y2) {

    var x = Math.pow((x2 - x1), 2),
        y = Math.pow((y2 - y1), 2);
        
    return (Math.pow((y + x), (1/2)));
};

/**
 * Function to be used for 'pre-defined' rooms. All drawing will be done 'clockwise', and
 * will follow the angle-axis predefined. (180 is straight to the right, 270 is downwards etc.)
 * @param {array} ang - Array with predefined angles and wall-lengths for the chosen room-shape.
**/
DrawRoom.prototype.createRoom = function(ang) {

    var p1,
        p2,
        initPoint,
        p2tmp,
        tmpAng;
    
        TFplanner.options.preDefArr = ang;
        this.clearRoom();
        this.initRoom();

        // The selfDrawn-flag is set as false, since we now have created a predefined room. 
        TFplanner.ourRoom.selfDrawn = false;
        
    // Looping through the number of walls in the room.
    for (var i = 0, ii = ang[0].length; i < ii; i++) {


        // The first wall is a horizontal wall, starting in point (150, 150).
        // The wall is ending in p2, which is the length of the wall, added to p1.
        if (i === 0) {
            p1 = {x: 350, y: 150};
            p2tmp = parseInt(ang[1][i]);
            p2 = {x: (p2tmp + p1.x), y: p1.y};
            initPoint = p1;

            // A special case for the first wall, used inn 'wallEnd'-function.
            if (this.lastPoint === null) {
                this.lastPoint = p1;
            }

        // The ending point of the walls are calculated out from the angles stored in the array.
        } else {
            p1 = this.lastPoint;
            tmpAng = parseInt(ang[0][i]);
            p2tmp = parseInt(ang[1][i]);

            if (tmpAng == 270) {
                p2 = {x: p1.x, y: (p1.y + p2tmp)};

            } else if (tmpAng == 180) {
                p2 = {x: (p1.x + p2tmp), y: p1.y};

            } else if (tmpAng == 360) {
                p2 = {x: (p1.x - p2tmp), y: p1.y};

            } else if (tmpAng == 90 && i != ang[0].length-1) {
                p2 = {x: p1.x, y: (p1.y - p2tmp)};
            // This means 'finish the room'
            } else if (i == ang[0].length-1 && tmpAng == 90) {
                p2 = initPoint;
            }
        }
        // Uses the same functionality as when the user is 'manually' drawing a room.
        this.wallEnd(p2);
    }
};

/**
 * Function removes the currently drawn room and resets handlers and variables.
**/
DrawRoom.prototype.clearRoom = function() {

    //Empties walls-arrays
    this.walls.remove();
    this.walls.clear();

    if (this.tmpWall) {
        this.clearTmp();
    }

    TFplanner.obstacles.clearSets();
    
    this.lastPoint = null;
    this.proximity = false;
    this.finished = false;
    this.xAligned = false;
    this.yAligned = false;
    this.selfDrawn = true;

    $('#canvas_container').unbind('click');
    $('#canvas_container').unbind('mousemove');
    $(document).unbind('keydown');

    if (TFplanner.finishedRoom) {
        TFplanner.finishedRoom.nullify();
    }

    TFplanner.measurement.refreshMeasurements();
};

/**
 * Function that deletes and nullifies all of the temp-stuff.
**/
DrawRoom.prototype.clearTmp = function() {

    var measures = TFplanner.measurement;

    this.tmpWall.remove();
    this.tmpWall = null;
    this.tmpRect.remove();
    this.tmpRect = null;
    this.tmpLen.remove();
    this.tmpLen = null;

    // tmpangle visual are removed and set to null.
    if (measures.tmpAngle != null) {
        measures.tmpAngle[1].remove();
        measures.tmpAngle[2].remove();
        measures.tmpAngle = null;
    }
};

/**
 * @class Creates the tabs that is displayed on the lefthand-side
 * of the webpage. 
**/
function Tabs() {
    this.tabPaper = Raphael(document.getElementById('menu'));
    this.room = this.tabPaper.set();
    this.obst = this.tabPaper.set();
    this.spec = this.tabPaper.set();
    this.initTabs();
}
// Thermo-Floors selected colors for the tabs
Tabs.prototype.roomColor = '#CBC4BC';
Tabs.prototype.obstColor = '#B6ADA5';
Tabs.prototype.specColor = '#A59C94';

/**
 * Creating SVG-paths for the three vertical tabs, and adding text to them.
**/
Tabs.prototype.initTabs = function() {

    var height = this.tabPaper.height/3,
        width = this.tabPaper.width,
        diffHeight = 35,

    rooms = this.tabPaper.path('M 0 0 L '+width+' 0 L'+width+' '+(height)+' L 0 '+(height+diffHeight)+' L 0 0').attr({
        fill: this.roomColor,
        stroke: this.roomColor,
        'stroke-width': 0,
        title: 'Klikk for rom-tegning'
    }),

    obstacles = this.tabPaper.path('M 0 '+(height-diffHeight)+' L'+width+' '+height+' L'+width+' '+height*2+' L 0 '+((height*2)+diffHeight)+' L 0 '+height).attr({
        fill: this.obstColor,
        stroke: this.obstColor,
        'stroke-width': 0,
        title: 'Klikk for innsetting av hindringer'
    }),

    specs = this.tabPaper.path('M 0 '+((height*2)-diffHeight)+' L'+width+' '+height*2+' L'+width+' '+height*3+' L 0 '+height*3+' L 0 '+height*2).attr({
        fill: this.specColor,
        stroke: this.specColor,
        'stroke-width': 0,
        title: 'Klikk for valg av spesifikasjoner'
    }),

    roomTxt = this.tabPaper.text(width/2, height/2, 'Tegne rom'),
    obstTxt = this.tabPaper.text(width/2, this.tabPaper.height/2, 'Hindringer'),
    specTxt = this.tabPaper.text(width/2, (this.tabPaper.height/2)+height, 'Spesifikasjoner'),

    /**
     * Function for setting handlers and color-stuff for the tabs.
     * @param coll - A set of elements that we set the handlers for.
     * @param val - The tab-number.
    **/
    createHandlers = function(coll, val) {

        coll[1].attr({
            'font-size': 24,
            'fill': 'black',
            'font-weight': 'bold'
        });

        coll.attr({
            cursor: 'pointer'
        }).mouseup(function () {
            TFplanner.tabs.select(val);
            TFplanner.options.showOptions(val);
        });
    };

    roomTxt.rotate(90);
    obstTxt.rotate(90);
    specTxt.rotate(90);

    createHandlers(this.room.push(rooms, roomTxt), 1);
    createHandlers(this.obst.push(obstacles, obstTxt), 2);
    createHandlers(this.spec.push(specs, specTxt), 3);

    // Default select.
    this.select(1);
};

/**
 * Functionality that does visual changes on tab select.
 * @param {int} index - Index of the tab to set in 'focus'
**/
Tabs.prototype.select = function(index) {

    // Default tab to the front
    this.spec.toFront();
    this.obst.toFront();

    // Different actions for each of the tabs.
    switch (index) {

        case 1 :
            this.room.toFront();
            this.room[1].attr('fill', '#CB2C30');
            this.obst[1].attr('fill', 'black');
            this.spec[1].attr('fill', 'black');
            break;

        case 2 : 
            this.obst.toFront();
            this.obst[1].attr('fill', '#CB2C30');
            this.room[1].attr('fill', 'black');
            this.spec[1].attr('fill', 'black');
            break;

        case 3 :
            this.spec.toFront();
            this.spec[1].attr('fill', '#CB2C30');
            this.room[1].attr('fill', 'black');
            this.obst[1].attr('fill', 'black');
            break;
    }
};

/**
 * @class Holds the buttons/icons at the 'footer' of the GUI.
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
                            // The data can console logged for the purpose of catching errors from the PHP-script.
                            //console.log(data);
                            callback(data, true);
                        });
                },
                /**
                 * Download function that depending on parameters given lets the user save from a dataUrl (to png) or a proper url (pdf).
                 * @param: url.
                 * @param: exporting. boolean that on true adds a prefix to the url for PDF download.
                **/
                download = function(url, exporting) {
                    var a = document.createElement('a'),
                    // if exporting use export prefix
                    location = (exporting) ? 'export/'+url : url;
                    
                    window.open(location, '_blank');

                };

            $('#pngchosen').click(function() {
                type = '.png';
                removePopup();

                var pngElement =  document.getElementById('myCanvas');

                //Use canvg-package to draw on a 'not-shown' canvas-element.
                canvg(pngElement, svg);

                // Used so we are sure that the canvas is fully loaded before .png is generated.
                setTimeout(function() {
                    // Fetch the dataURL from the 'myCanvas', then force a download of the picture, with a defined filename.
                    var dataURL = pngElement.toDataURL('image/png');

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
    help.transform('t'+((width/6)-17)+','+((height/2)-15)+',s1.3');
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
        // In the future, this may be a 'Help'-button 
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

    // remove any objects that may harm the construction of a new room within:
    // Drawroom
    ns.ourRoom.clearRoom();
    // Measurement

    ns.measurement.deconstructAid();

    // Create new objects
    ns.grid = new Grid();
    ns.scrollBox = new ScrollBox();
    ns.measurement = new Measurement();
    ns.ourRoom = new DrawRoom(20);
    ns.tabs = new Tabs();
    ns.options = new Options();
    ns.finishedRoom = null;
    ns.obstacles = new Obstacles();

};

/**
 * @class Used when the user choose to add obstacles in the room.
**/
function Obstacles() {

    this.paper = TFplanner.grid.paper;
    this.obstacleSet = this.paper.set();
    this.txtSet = this.paper.set();
    this.lineSet = this.paper.set();
}

Obstacles.prototype.xPos = 0;
Obstacles.prototype.yPos = 0;
Obstacles.prototype.supplyPoint = null;
// True means that the mat needs to both start and end at the supplypoint/wall.
// false means that it will start at the supplypoint/wall but not end there.
Obstacles.prototype.supplyEnd = true;

/**
 * Function that draws obstacles on the grid paper, 
 * based on the size defined here.
 * @param {int} num - The internal value of the added obstacle
 * @param {String} txt - The text to be set on the obstacle
**/
Obstacles.prototype.createObstacle = function(num, txt) {

    var w, 
        h,
        x = 100,
        y = 100,
        ns = TFplanner,
        paper = this.paper,
        obst = this,
        obstacle,
        txtPoint,
        txtField,
        
        /**
         *  Function that finds the wall that is most western.
         *  Returns its middlepoint.
        **/
        westernWall = function() {

            var walls = TFplanner.ourRoom.walls,
                wall,
                newWall,
                west = null;

            for (var i = 0, ii = walls.length; i < ii; i++) {

                wall = walls[i];

                if (west === null) {
                    west = wall.getPointAtLength((wall.getTotalLength() / 1.75));

                } else {
                    newWall = wall.getPointAtLength((wall.getTotalLength() / 1.75));

                    if (newWall.x < west.x) {
                        west = newWall;
                    }
                }
            }

            x = west.x;
            y = west.y;
        };

    // Setting width and height values based on input
    switch (num) {
        // drain
        case '1':
            w = 40;
            h = 40;
            break;
        // toilet
        case '2': 
            w = 40;
            h = 80;
            break;
        // shower
        case '3':
            w = 90;
            h = 90;
            break;
        // bathtub
        case '4':
            w = 170;
            h = 80;
            break;
        // Connection-point
        case '5':
            w = 10;
            h = 10;
            westernWall();
            break;
        // Bench
        case '6':
            w = 200;
            h = 70;
            break;
        // Chimney
        case '7':
            w = 100;
            h = 100;
            break;
        // Obstacle with no name, so the user can define the name and values herself.
        case '8':
            w = 100;
            h = 100;
            break;

        default:
            return;
    }

    // Obstacle created
    obstacle = paper.rect(x, y, w, h).attr({
        fill: '#E73029',
        'fill-opacity': 0.4,
        'stroke-opacity': 0.4
    });

    // Define the id of the preferred supplypoint, added by the user.
    // If multiple supplypoints, the first one will be used!
    if (this.supplyPoint === null && num == 5) {
        this.supplyPoint = obstacle.id;
    }

    // Storing custom data.
    obstacle.data('obstacleType', txt);

    // Obstacle text related variables.
    txtPoint = {x: (x + (w / 2)), y: (y + (h / 2))};
    txtField = paper.text(txtPoint.x, txtPoint.y, txt).attr({
            opacity: 1,
            'font-size': 12,
            'font-family': 'verdena',
            'font-style': 'oblique'
    }).toBack();

    var start = function() {

            this.ox = this.attr('x');
            this.oy = this.attr('y');
            w = this.attr('width');
            h = this.attr('height');
            
            this.startTime = Date.now();

            this.latency = TFplanner.latency;

            obst.selectObstacle();

            this.attr({fill: '#3366FF'});

            obst.nearestWalls(null, this);

            for (var i = 0, ii = obst.obstacleSet.length; i < ii; i++) {

                if (this == obst.obstacleSet[i]) {
                    this.rectID = i;
                    break;
                }
            }
        },

        move = function(dx, dy) {

            var xy = (!ns.grid.zoomed) ? [dx, dy] : ns.grid.getZoomedXY(dx, dy, true),
                newx = this.ox + xy[0],
                newy = this.oy + xy[1],
                obstx,
                obsty,
                nowTime,
                timeDiff;

            newx = (Math.round((newx / 10)) * 10);
            newy = (Math.round((newy / 10)) * 10);

            // Updates obstacle list :)
            if (this.rectID) {
                ns.options.obstacleList(this.rectID);
            }

            // Updating measurements every 50 ms
            nowTime = Date.now();
            timeDiff = (nowTime - this.startTime);

            if (timeDiff > this.latency) {

                this.attr({
                    x: newx,
                    y: newy
                });

                // Obstacle text related action
                obstx = (newx + (w / 2));
                obsty = (newy + (h / 2));

                txtField.attr({
                    x: obstx,
                    y: obsty
                });

                obst.nearestWalls(null, this);
                this.startTime = nowTime;
            }
        },

        up = function() {

            this.attr({fill: '#E73029'});

            obst.lineSet.remove();
            obst.lineSet.clear();
        };

    obstacle.drag(move, start, up);

    this.obstacleSet.push(obstacle);
    this.txtSet.push(txtField);
};

/**
 * Action related to the placement of obstacle-text.
 * @param {int} i - Index of the targeted obstacle
 * @param {int} w - The width of the obstacle
 * @param {int} h - The height of the obstacle
 * @param {int} x - X-coordinate of the obstacle
 * @param {int} y - Y-coordinate of the obstacle
**/
Obstacles.prototype.adjustSize = function(i, w, h, x, y) {

    var obstx = (x + (w / 2)),
        obsty = (y + (h / 2));

    this.obstacleSet[i].attr({
        'width': w, 
        'height': h,
        x : parseInt(x),
        y : parseInt(y)
    });

    this.txtSet[i].attr({
        x : obstx,
        y : obsty
    });

    // Update the lenght line
    this.nearestWalls(null, this.obstacleSet[i]);
};

/**
 * Function that visually selects an obstacle by changing its fill color.
 * @param {int} id - Id of the targeted obstacle
**/
Obstacles.prototype.selectObstacle = function(id) {

    for (var i = 0, ii = this.obstacleSet.length; i < ii; i++) {

        if (i == id) {
            this.obstacleSet[i].attr({fill: '#3366FF'});

        } else {
            this.obstacleSet[i].attr({fill: '#E73029'});
        }
    }

    if (id != null) {
        this.nearestWalls(id);

    } else {
        this.lineSet.remove();
        this.lineSet.clear();
    }
};

/**
 * Remove the obstacle, based on which remove-button that was pushed.
 * @param {int} id - Id of targeted obstacle for deletion
**/
Obstacles.prototype.deleteObstacle = function(id) {

    for (var i = 0, ii = this.obstacleSet.length; i < ii; i++) { 
        // Match on the ID, clean text and obstacle, and return
        if (i == id) {
            this.obstacleSet.splice(i, 1).remove();
            this.txtSet.splice(i, 1).remove();
            this.lineSet.remove();
            this.lineSet.clear();
            return;
        }
    }
};

/**
 * Function that visualizes the the nearest horizontal
 * and vertical wall of the targeted obstacle.
 * @param {int} id - Id of the obstacle
 * @param {rect} obst - Current targeted obstacle
**/
Obstacles.prototype.nearestWalls = function(id, obst) {

    // Declaring obstacle center coordinates
    var obstacle = (id != null) ? this.obstacleSet[id] : obst,
        cx = (obstacle.attr('x') + (obstacle.attr('width') / 2)),
        cy = (obstacle.attr('y') + (obstacle.attr('height') / 2)),
        walls = TFplanner.ourRoom.walls,
        maxX = 0,
        maxY = 0,
        tmp1x, tmp1y, tmp2x, tmp2y,
        tri,
        that = this,

        /**
         * Function that draw lines that show length from obstacle to nearest walls.
        **/
        lengthLine = function() {

            var rad, 
                P1, 
                P2,
                /**
                 * Calculates length from the obstacle to the nearest wall
                **/
                measurementO = function() {

                    var textRect,
                        textPoint,
                        text,
                        line = that.paper.path('M'+P1[0]+','+P1[1]+' L'+P2[0]+','+P2[1]).attr( {
                            stroke: '#3366FF'
                        }),
                        length = (TFplanner.ourRoom.vectorLength(P1[0], P1[1], P2[0], P2[1]) / 100);

                    // Do not show the length-stuff unless it is >= 20cm.
                    if (length >= 0.20) {
                        textPoint = line.getPointAtLength((length / 2));
                        textRect = that.paper.rect(textPoint.x-25, textPoint.y-10, 50, 20, 5, 5).attr({
                            opacity: 1,
                            fill: 'white'
                        });

                        text = that.paper.text(textPoint.x, textPoint.y, length + ' m').attr({
                            opacity: 1,
                            'font-size': 12,
                            'font-family': 'verdana',
                            'font-style': 'oblique'
                        });
                    }

                    that.lineSet.push(line, textRect, text);
                };

            // Create the horizontal line
            if (tri === 1 || tri === 3) {

                rad = ((obstacle.attr('width') / 2) * (-1));
                P1 = [100, cy];
                P2 = [(cx + rad), cy];
                measurementO();
            } 
            // Creating vertical line
            if (tri === 2 || tri === 3) {
                
                rad = ((obstacle.attr('height') / 2) * (-1));
                P1 = [cx, 100];
                P2 = [cx, (cy + rad)];
                measurementO();
            }
        };

    // Removing past lines.
    this.lineSet.remove();
    this.lineSet.clear();

    // Returning if the obstacle is outside room (to the left or top).
    if (cx < 100 || cy < 100) {
        return;
    }

    // Check if the cx or cy is out of bounds in regards to the room
    for (var i = 0, ii = walls.length; i < ii; i++) {

        tmp1x = walls[i].attrs.path[0][1];
        tmp1y = walls[i].attrs.path[0][2];
        tmp2x = walls[i].attrs.path[1][1];
        tmp2y = walls[i].attrs.path[1][2];

        // Chained ternaries
        maxX = (tmp1x > maxX) ? (tmp2x > tmp1x) ? tmp2x : tmp1x : maxX;
        maxY = (tmp1y > maxY) ? (tmp2y > tmp1y) ? tmp2y : tmp1y : maxY;
    }

    /**
     * This variable tells the lengthline function to draw either one or both lines.
     * 1: Draw the horizontal line
     * 2: Draw the vertical line
     * 3: Draw both
    **/
    tri = (cx < maxX) ? (cy < maxY) ? 3 : 2 : (cy < maxY) ? 1 : null;

    lengthLine();
};

/**
 * Used for clearing the sets that show the obstacles and length-stuff.
 * Called when we are pushing the 'new' button.
**/
Obstacles.prototype.clearSets = function() {

    this.obstacleSet.remove();
    this.obstacleSet.clear();
    this.txtSet.remove();
    this.txtSet.clear();
    this.lineSet.remove();
    this.lineSet.clear();
};

/**
 * @class Setting up content for the tabs on the 
 * lefthand-side of the page.
**/
function Options() {
    this.optPaper;
    // Default show.
    this.showOptions(1);
    // Showing title once options is loaded.
    this.setTitle();
}

Options.prototype.preDefArr = null;
Options.prototype.optionTab = 1;
// Default color
Options.prototype.defColor = '#707061';
// Color for mouseover
Options.prototype.inColor = '#d8d8d8';
// Color for the button-icons
Options.prototype.imgColor = 'white';
// Raphael-element for displaying title
Options.prototype.titleText = null; 
Options.prototype.areaText = null;
Options.prototype.titleRect = null;
Options.prototype.projectName ='Prosjektnavn/tittel';
Options.prototype.container = '#content_container';
Options.prototype.obstHtml = null;
Options.prototype.crossO = String.fromCharCode(248);
Options.prototype.dotA = String.fromCharCode(229);
// Mat-object based on specifications selected
Options.prototype.validMat = null;
// Will contain mat-lengths the user prefer to start with
Options.prototype.prefMat = null;
// Variable saved after resultgrid has calculated available area
Options.prototype.availableArea = null;
// String storing area and utilized percentage of area
Options.prototype.utilizeString = null;

/**
 * Function that control what options to show based on selected tab.
 * @param {int} tab - What tab to show/select
**/
Options.prototype.showOptions = function(tab) {

    var finRoom = TFplanner.finishedRoom;

    this.optionTab = tab;

    // Remove selected wall if any.
    if (finRoom != null && finRoom.selectedWall != null) {
        finRoom.selectedWall.remove();
    }

    $(this.container).empty();

    this.optPaper = (this.optPaper != null) ? this.optPaper.remove() : null;
    this.optPaper = Raphael(document.getElementById('content_container'));

    // Decide which tab to display
    switch (tab) {
        
        case 1:
            this.initDraw();
            break;

        case 2:
            this.initObstacles();
            break;

        case 3: 
            this.initSpecs();
            break;

        // Case 4 is actually "sub options".
        case 4:
            this.initDefine();
            break;

        default:
            return;
    }
};

/**
 * Initialize the specifications-tab, creating
 * elements using JavaScript, add them to the 
 * DOM using jQuery.
**/
Options.prototype.initSpecs = function() {

    // Set title position
    this.setTitle();

    var html,
        opts = this,
        doc = document,
        header,
        inOutDiv,
        inOut,
        form,
        option1,
        option2,
        span;

    // Clear current html
    $(this.container).html("");

    // Adding class css, and remove the old ones.
    $(this.container).addClass('specTab');
    $(this.container).removeClass('obstacleTab');
    $(this.container).removeClass('roomTab');


    if (TFplanner.ourRoom.finished === true) {
        // Variables used for setting up elements, created
        // by using pure JavaScript
        header = doc.createElement('h3');
        inOutDiv = doc.createElement('div');
        inOut = doc.createElement('select');
        form = doc.createElement('form');
        option1 = doc.createElement('option');
        option2 = doc.createElement('option');
        span = doc.createElement('span');
        
        header.textContent = 'Velg spesifikasjoner';
        span.textContent = 'Velg utend'+this.crossO+'rs/innend'+this.crossO+'rs: ';

        inOutDiv.id = 'inOutDiv';
        inOut.id = 'inOutType';
        form.setAttribute('class', 'forms');
        
        option1.value = 'inside';
        option1.textContent = 'Inne';
        option2.value = 'outside';
        option2.textContent = 'Ute';

        inOut.add(option1, null);
        inOut.add(option2, null);
        // Add the elements to the DOM, using jQuery
        $(inOutDiv).append(span, inOut, '<br');
        $(form).append(inOutDiv);
        $(this.container).append(header, form);

        // Default selected is 'none', so a value MUST be chosen by the user.  
        $('#inOutType').val(-1);

    } else {
        // Error if the room is not 'finished' (closed area)
        html = '<p class="error"> Du m'+this.dotA+' tegne et rom f'+this.crossO+'rst! <br></p>';
        $(this.container).html(html);
    }

    $('#inOutType').change( function() {

        // If #inOutType-id changes, we want to clear ALL the DIVs following it:
        $('#dryWetDiv').remove();
        $('#deckDiv').remove();
        $('#wattDiv').remove();
        $('#castDiv').remove();
        $('#inputDiv').remove();
        $('#lengthDiv').remove();
        $('#matDiv').remove();
        
        opts.inOrOut(form);
    });
};

/**
 * Functionality for showing dropdown-menu for chosing 'dry- or wet-area'.
 * Will only show this option if 'inside' is chosen on the first dropdown.
 * @param {Form} form - Form of the page, passed to all follwing functions.
**/
Options.prototype.inOrOut = function(form) {

    var selected = $('#inOutType').val(),
        opts = this,
        doc = document,
        dryWetDiv,
        dryWet,
        option1,
        option2,
        span;

    //Inside is selected
    if (selected === 'inside') {
        dryWetDiv = doc.createElement('div');
        dryWet = doc.createElement('select');
        option1 = doc.createElement('option');
        option2 = doc.createElement('option');
        span = doc.createElement('span');

        dryWetDiv.id = 'dryWetDiv';
        dryWet.id = 'climateType';

        span.textContent = 'Velg v'+this.dotA+'trom/t'+this.crossO+'rrom: ';
        option1.value = 'dry';
        option1.textContent = 'T'+this.crossO+'rrom';
        option2.value = 'wet';
        option2.textContent = 'V'+this.dotA+'trom';

        dryWet.add(option1, null);
        dryWet.add(option2, null);

        $(dryWetDiv).append(span, dryWet, '<br>');
        $(form).append(dryWetDiv);
        // Append the form to the container.
        $(this.container).append(form); 
        // Set default selected to 'none'
        $('#climateType').val(-1);

    } else {
        // 'Outside' is chosen, so we jump directly to the associated options.
        opts.chooseDeck(form);
    }

    // Call new function to set up the 'deck'-dropdown on change.
    $('#climateType').change( function() {

        //If this one changes, we want to remove all the divs following it:
        $('#deckDiv').remove();
        $('#wattDiv').remove();
        $('#castDiv').remove();
        $('#inputDiv').remove();
        $('#lengthDiv').remove();
        $('#matDiv').remove();

        opts.chooseDeck(form);
    });
};

/**
 * The third dropdown-menu, where the user must choose type of deck for the area.
 * @param {Form} form - Form of the page, passed to all follwing functions.
**/
Options.prototype.chooseDeck = function(form) {

    var opts = this,
        selected = $('#inOutType').val(),
        selectedClim = $('#climateType').val(),
        doc = document,
        deckDiv = doc.createElement('div'),
        span = doc.createElement('span'),
        deck = doc.createElement('select'),
        option1 = doc.createElement('option'),
        option2 = doc.createElement('option'),
        option3 = doc.createElement('option'),
        option4 = doc.createElement('option'),
        option5 = doc.createElement('option'),
        option6 = doc.createElement('option'),
        option7 = doc.createElement('option');

    deckDiv.id = 'deckDiv';
    deck.id = 'deckType';

    span.textContent = 'Velg dekke i rommet: ';

    // Do stuff for an indoor-room.
    if (selected === 'inside') {
        // Tiles and scale can occur both in dry-rooms and wet-rooms.
        option1.value = 'tile';
        option1.textContent = 'Flis';
        option5.value = 'scale';
        option5.textContent = 'Belegg';
        // 'Dry-room'
        if (selectedClim === 'dry') {
            // List options for 'dry'-rooms.
            option2.value = 'carpet';
            option2.textContent = 'Teppe';
            option3.value = 'parquet';
            option3.textContent = 'Parkett';
            option4.value = 'laminat';
            option4.textContent = 'Laminat';
            option6.value = 'concrete';
            option6.textContent = 'Betong';
            option7.value = 'cork';
            option7.textContent = 'Kork';

            deck.add(option1, null);
            deck.add(option2, null);
            deck.add(option3, null);
            deck.add(option4, null);
            deck.add(option5, null);
            deck.add(option6, null);
            deck.add(option7, null);

        // This should obviously be a 'wet'-room.
        } else if (selectedClim === 'wet') {
            deck.add(option1, null);
            deck.add(option5, null);
        }
    // The area is chosen as 'outside' 
    } else if (selected === 'outside') {
        option1.value = 'asphalt';
        option1.textContent = 'Asfalt';
        option2.value = 'pavblock';
        option2.textContent = 'Belegningsstein';
        option3.value = 'concrete';
        option3.textContent = 'St'+this.crossO+'p';

        deck.add(option1, null);
        deck.add(option2, null);
        deck.add(option3, null);
    }

    // Append the element to our form, then add the form to the container.
    $(deckDiv).append(span, deck, '<br>');
    $(form).append(deckDiv);
    $(this.container).append(form);

    // Set as blanc on initialization, to force the user to select an !default item.
    $('#deckType').val(-1);

    // When the user have selected an item in this list, the 'generate'-button is created,
    // unless 'wattage' also has to be selected.
    $('#deckType').change( function() {

        // Cleaning up some html-elements, if they exist:
        $('#wattDiv').remove();
        $('#castDiv').remove();
        $('#inputDiv').remove();
        $('#lengthDiv').remove();
        $('#matDiv').remove();
        
        // Calling next function, based on selected value.
        (selected === 'inside') ? opts.wattage(form) : opts.generateButton(form);
    });
};

/**
 * Function that adds a wattage dropdown select list button chooser.
 * @param {Form} form - Form of the page, passed to all follwing functions.
**/
Options.prototype.wattage = function(form) {

    var opts = this,
        doc = document,
        span = doc.createElement('span'),
        watt = doc.createElement('select'),
        wattDiv = doc.createElement('div'),
        option1 = doc.createElement('option'),
        option2 = doc.createElement('option'),
        option3 = doc.createElement('option'),
        option4 = doc.createElement('option');

    wattDiv.id = 'wattDiv';
    watt.id = 'wattage';

    span.textContent = 'Velg mattens effekt: ';
    option1.value = 60;
    option1.textContent = '60W';
    option2.value = 100;
    option2.textContent = '100W';
    option3.value = 130;
    option3.textContent = '130W';
    option4.value = 160;
    option4.textContent = '160W';

    watt.add(option1, null);
    watt.add(option2, null);
    watt.add(option3, null);
    watt.add(option4, null);

    // Append the element to our form, then add the form to the container.
    $(wattDiv).append(span, watt, '<br>');
    $(form).append(wattDiv);
    $(this.container).append(form);

    // Set as blanc on initialization, to force the user to select an !default item.
    $('#wattage').val(-1);

    // When the user have selected an item in this list, the 'generate'-button is created.
    $('#wattage').change( function() {

        var deck = $('#deckType').val(),
            watt = $('#wattage').val();

        // The elements that follow #wattage will be removed, before they are added again.
        $('#castDiv').remove();
        $('#inputDiv').remove();
        $('#lengthDiv').remove();
        $('#matDiv').remove();

        // For one specific option, casting/not casting must be made available.
        if ((deck === 'parquet' || deck === 'laminat') && watt === '60') {
            opts.casting(form);
        } else {
            opts.generateButton(form);
        }
    });
};

/**
 * Functionality that asks the user if casting is to be done for the floor
 * @param {Form} form - form of the tab, passed through all the connected functions, 
 * holds the html-structure.
**/
Options.prototype.casting = function(form) {

    var opts = this,
        doc = document,
        castDiv = doc.createElement('div'),
        span = doc.createElement('span'),
        cast = doc.createElement('select'),
        option1 = doc.createElement('option'),
        option2 = doc.createElement('option');

    cast.id = 'casting';
    castDiv.id = 'castDiv';

    span.textContent = 'Skal gulvet avrettes?';
    option1.value = 'nocast';
    option1.textContent = 'Nei';
    option2.value = 'cast';
    option2.textContent = 'Ja';

    cast.add(option1, null);
    cast.add(option2, null);

    $(castDiv).append(span, cast);
    // Append the element to our form, then add the form to the container.
    $(form).append(castDiv);
    $(this.container).append(form);
    // Set as blanc on initialization, to force the user to select an !default item.
    $('#casting').val(-1);

    // When the user have selected an item in this list, the 'generate'-button is created.
    $('#casting').change( function () {

        $('#inputDiv').remove();
        $('#lengthDiv').remove();
        $('#matDiv').remove();

        opts.generateButton(form);
    });
};

/**
 * Creation of a button to generate our solution for putting out a heatingmat.
 * Will be created when an item is chosen in all the dropdowns.
 * @param {Form} form - The form is passed "all the way" through the 'specs'-functionality and
 * stuff is appended to it.
**/
Options.prototype.generateButton = function(form) {

    var ns = TFplanner,
        theRoom = ns.ourRoom,
        theGrid = ns.grid,
        opts = this,
        doc = document,
        input = doc.createElement('input'),
        inputDiv = doc.createElement('div'),
        path,
        createProgresswindow = function(callback) {

            var grayDiv = doc.createElement('div'),
                infoDiv = doc.createElement('div'),
                information = doc.createElement('p');

            grayDiv.id = 'progress';
            infoDiv.id = 'infoprogress';
            information.id = 'progressinformation';

            information.textContent = 'Kalkulerer areal';
            
            $(infoDiv).append(information);
            $('#container').append(grayDiv, infoDiv);

            setTimeout(function() {
                callback();
            }, 10);
        };

    inputDiv.id = 'inputDiv';
    input.id = 'genButton';
    input.type = 'button';
    input.title = 'Klikk for '+this.dotA+' generere leggeanvisning';
    input.value = 'Generer leggeanvisning';

    $(inputDiv).append(input, '<br><br><br>');
    $(form).append(inputDiv);
    $(this.container).append(form);

    $('#genButton').click(function() {
        // If we have a finished room, we can call the algorithm and generate a drawing!
        if (theRoom.finished === true) {

            createProgresswindow(function() {
                // Moving room incase user did not visit "obstacles", also saves the new path
                // and send it as parameter to resultGrid.
                path = theGrid.moveRoom();
                ns.resultGrid = new ResultGrid(path);
            });
        }
    });

    // When we have chosen all steps and the 'generate-button' is created, we also want
    // to display the possible mats the user prefer to use.
    opts.preferredMats(form);
};

/**
 * Function that either removes progress or updates it.
 * @param {boolean} remove - Wether to remove the progress-visual or not.
 * @param {boolean} success - Wether area has successfully been calculated.
**/
Options.prototype.updateProgress = function(remove, success) {

    var theRoom = TFplanner.ourRoom,
        measures = TFplanner.measurement,
        grid = TFplanner.grid,
        doc = document,

        /**
         * Function that calculates the percentage of which the 
         * mats utilize the available area. Adds the values 'availableArea'
         * and 'areaUtilPercentage' as a string to the projectname.
        **/
        areaUtilization = function(obj) {
            // Decides wether to remove decimals or not.
            var availArea = ((obj.availableArea % 1) !== 0) ? obj.availableArea.toFixed(2) : obj.availableArea,
                chosenMats = TFplanner.resultGrid.chosenMats,
                matInfo = obj.validMat.products,
                squareMetres = 0,
                areaUtilPercentage = null;

            // Goes through mats used and the product info for matching values.
            // Adds the meters of the chosen mats.
            for (var j = 0, jj = chosenMats.length; j < jj; j++) {
                for (var i = 0, ii = matInfo.length; i < ii; i++) {

                    if (chosenMats[j] == matInfo[i].number) {
                        squareMetres += (matInfo[i].length / 2);
                    }
                }
            }
            
            areaUtilPercentage = ((100 / availArea) * squareMetres).toFixed(1);
            obj.utilizeString = availArea+'m2 ('+areaUtilPercentage+'% utnyttelse)';
            obj.setTitle();
        };

    // Removing the progress visual
    if (remove) {
        if (success) {
            areaUtilization(this);
        }
        doc.getElementById('progress').remove();
        doc.getElementById('infoprogress').remove();

        theRoom.walls.toFront();
        measures.finalMeasurements();
        grid.boxSet.toFront();

    } else {
        doc.getElementById('infoprogress').textContent = 'Kalkulerer leggeanvisning';

        // Give the JavaScript breathingroom for gui updates
        setTimeout(function() { 
            TFplanner.resultGrid.calculateGuide(); 
        }, 1);
    }
};

/**
 * This function makes it possible for the user to specify mat-length(s) to start with
 * in the room.
 * @param {Form} form - The form is passed "all the way" through the 'specs'-functionality and
 * stuff is appended to it.
**/
Options.prototype.preferredMats = function(form) {

    var opts = this,
        doc = document,
        span = doc.createElement('span'),
        lengths = doc.createElement('select'),
        add = doc.createElement('input'),
        lengthDiv = doc.createElement('div'),
        matDiv = doc.createElement('div'),
        ol = doc.createElement('ol'),
        text,
        availLengths = [];

    //Finds the correct heatingmat based on specs chosen by the user.
    this.tfProducts();
    this.prefMat = [];

    // Setting up the html-stuff.
    span.textContent = 'Legg til selvvalgte lengder';
    matDiv.id = 'matDiv';
    lengthDiv.id = 'lengthDiv';
    lengths.id = 'lengths';
    add.id = 'addLength';
    add.type = 'button';
    add.title = 'Legg til foretrukken mattelengde';
    add.value = 'Legg til matte';

    $(lengthDiv).append(span, lengths, add);
    $(matDiv).append(ol);
    $(form).append(lengthDiv, matDiv);

    // Add all the available lengths of this mat to the dropdown.
    for (var i = 0, ii = this.validMat.products.length; i < ii; i++) {
        availLengths[i] = this.validMat.products[i].length;
        $('#lengths').append('<option value='+i+'>'+availLengths[i]+'m</option>'); 
    }

    $(this.container).append(form);

    // This click-action add the chosen mat-length to array, so that
    // the algorithm will use this mat first.
    $('#addLength').click(function() {

        opts.prefMat.push(opts.validMat.products[$('#lengths').val()]);
        text = opts.prefMat[opts.prefMat.length-1].name;
        $(ol).append('<li>'+text+'</li>');
    });
};

/**
 * Set up 'Obstacles'-tab. This includes possibility 
 * to define Projectname and adding obstacles.
**/
Options.prototype.initObstacles = function() {

    var obst = TFplanner.obstacles,
        html = '';

    // Clear current html
    $(this.container).html(html);

    // Adding class css.
    $(this.container).addClass('obstacleTab');
    $(this.container).removeClass('specTab');

    if (TFplanner.ourRoom.finished === true) {
        // Move the room to coordinates (99, 99), but only if obstacles has not been loaded.
        if (obst.supplyPoint == null) {
            TFplanner.grid.moveRoom();
            obst.createObstacle('5', 'Startpunkt');
        }

        // Add inputfield and button to add a 'projectname'.
        html += '<h3> Sett prosjektnavn </h3>';
        html += '<form class=forms>';
        html += '<div class="inputfield"><input type="text" id="titleText" value='+this.projectName+' autocomplete="off"><br></div>';
        html += '<input id="titleSubmit" type="button" value="Endre prosjektnavn">';
        html += '</form>';

        // Header
        html += '<h3> Legg til hindring </h3>';

        // Form start
        html += '<form class=forms>';

        // Select (5 is missing, because same functionality is used for supplyPoint)
        html += "<select id ='obstacleType'><option value=1> Avl"+this.crossO+"p </option>";
        html += "<option value=2> Toalett </option>";
        html += "<option value=3> Dusj </option>";
        html += "<option value=4> Badekar </option>";
        html += "<option value=6> Benk </option>";
        html += "<option value=7> Pipe </option>";
        html += "<option value=8> Egendefinert </option></select>";

        // input button
        html += '<input id="defSubmit" type="button" value="Legg til">';

        // Form end
        html += '</form>';

        this.obstHtml = html;
    } else {
        html = '<p class="error"> Du m'+this.dotA+' tegne et rom f'+this.crossO+'rst! <br></p>';
        this.obstHtml = html;
    }

    this.obstacleList();

    // Set title position
    this.setTitle();
};

/**
 * Function that either refreshes or creates a list of obstacles.
 * Gets the html set in initObstacles (passed through function).
 * @param {int} obstacle - ID of an obstacle.
**/
Options.prototype.obstacleList = function(obstacle) {

    var ns = TFplanner,
        obstacleArr = ns.obstacles.obstacleSet,
        change = 'Endre',
        save = 'Lagre',
        del = 'Slett',
        html = this.obstHtml;

    for (var i = 0, ii = obstacleArr.length; i < ii; i++) {

        // Displaying "hindring" as name of the obstacle if no name is set (only in the html)
        if (obstacleArr[i].data('obstacleType') !== "") {

            html += "<div class=obst><div class=obsttxt>"+obstacleArr[i].data('obstacleType')+": </div><input id="+i+" class='change' type='button' value="+change+">"+ 
            "<input class='delete' type='button' value="+del+"></div>";
            html += "<br>";

        } else {
            html += "<div class=obst><div class=obsttxt>Hindring:</div><input id="+i+" class='change' type='button' value="+change+">"+ 
            "<input class='delete' type='button' value="+del+"></div>";
            html += "<br>";
        }

        if (obstacle == i) {
            var width = obstacleArr[i].attrs.width,
                height = obstacleArr[i].attrs.height,
                x = obstacleArr[i].attrs.x,
                y = obstacleArr[i].attrs.y,
                increase = "<input class='plusminus' type='button' name='increase' value='+' />",
                decrease = "<input class='plusminus' type='button' name='decrease' value='-' />";

            // Div start by a line break
            html += "<br>";
            html += "<div id=change class='roomTab'>";
            // Height
            html += "<div class='inputfield'><div class='inputtext'>H"+this.crossO+"yde: </div>"+decrease+"<input  type='number' id='height' value="+height+">"+increase+"<br></div>";
            // Width
            html += "<div class='inputfield'><div class='inputtext'>Bredde: </div>"+decrease+"<input  type='number' id='width' value="+width+">"+increase+"<br></div>";
            // position x
            html += "<div class='inputfield'><div class='inputtext'>X avstand: </div>"+decrease+"<input type='number' id='posx' value="+(x - 100)+">"+increase+"<br></div>";
            // position y
            html += "<div class='inputfield'><div class='inputtext'>Y avstand: </div>"+decrease+"<input type='number' id='posy' value="+(y - 100)+">"+increase+"</div>";
            
            // Checks if the obstacletType stored equals "Startpunkt" which translates to "supplypoint" in english.
            // Creates checkbox
            if (obstacleArr[i].data('obstacleType') == 'Startpunkt') {
                html += "Kan slutte mot startvegg: <input type='checkbox' id='supplyend'>";
            }

            // Button element.
            html += "<input id=changeObst name="+i+" type='button' value="+save+">";

            // Div end.
            html += "</div>";
        }
    }

    $(this.container).html("");
    $(this.container).html(html);

    // Sets the focus on the 'project-name'-field the first time 'obstacles'-tab is selected
    if (ns.ourRoom.finished === true && this.titleText == null) {
        this.setTitle();
        var input = document.getElementById('titleText');
            input.focus();
            input.select();
    }

    this.actionListeners();
};

/**
 * Function that initiates action listeners for the
 * obstacle-tab
**/
Options.prototype.actionListeners = function() {

    var opts = this,
        obst = TFplanner.obstacles,
        doc = document;

    // If the 8th option is selected. aka "Egendefinert"
    $('#obstacleType').change(function() {
        
        if (this.value == 8) {

            // Creating elements.
            var parentDiv = doc.createElement('div'),
                textDiv = doc.createElement('div'),
                input = doc.createElement('input');
            
            // Setting properties.
            parentDiv.setAttribute('class', 'inputfield');
            parentDiv.id = 'inputfieldSelf';
            textDiv.setAttribute('class', 'inputtext');
            textDiv.textContent = 'Skriv inn navn: ';
            input.type = 'text';
            input.setAttribute('class', 'inputwidth');
            input.setAttribute('id', 'customObstTxt');
            input.setAttribute('autocomplete', 'off');

            // Adding the elements to its parentnode
            $(parentDiv).append(textDiv, input);

            // Using Jquery to add the parentDiv after the dropdown list
            $(this.parentNode.firstChild).after(parentDiv);
            // Put focus on, and selects the inputfield for adding a obstacle-name
            input.focus();
            input.select();

            $('#customObstTxt').keypress(function(e) {
                // If 'enter' is pressed in the inputfield:
                if (e.which == 13) {
                    e.preventDefault();

                    var value = $('#obstacleType').val(),
                        text = $('#customObstTxt').val();

                    // Create the obstacle, and update the tab.
                    obst.createObstacle(value, text);
                    opts.initObstacles();
                    opts.obstacleList();
                }
            });
        // We might get some issues if 'egendefinert' is chosen, followed by that the user choose an other
        // obstacle without pushing 'add' between. This will delete the <div> if it exists.
        } else if ($('#inputfieldSelf').val() != null) {
            $('#inputfieldSelf').remove();
        }
    });

    // Add click action for the "submit button".
    $('.change').click(function() {
        opts.obstacleList(this.id);
        obst.selectObstacle(this.id);
    });

    $('.delete').click(function() {
        obst.deleteObstacle(this.parentNode.firstChild.nextSibling.id);
        opts.obstacleList();
    });

    // Add click action for the "submit button".
    $('#defSubmit').click(function() {
        
        // Creating obstacle.
        var value = $('#obstacleType').val(),
            customTxt = $('#customObstTxt').val(),
            text = (customTxt != null) ? customTxt : $('#obstacleType option[value='+value+']').text();

        obst.createObstacle(value, text);

        // Creating / refreshing list of obstacles.
        opts.initObstacles();
        opts.obstacleList();
    });

    // Add click action for the "changeObst-button".
    $('#changeObst').click(function() {
        // Rounding the values to nearest 10.
        var roundX = (Math.round((($('#posx').val())/ 10)) * 10) + 100,
            roundY = (Math.round((($('#posy').val())/ 10)) * 10) + 100,
            roundW = (Math.round((($('#width').val())/ 10)) * 10),
            roundH = (Math.round((($('#height').val())/ 10)) * 10),
            supply = $('#supplyend').val();

        // stores the users choice on the matter of ending the mats at the supplywall or not.
        if (supply) {
            obst.supplyEnd = !supply.checked;
        }
        
        $('#posx').val((roundX - 100));
        $('#posy').val((roundY - 100));

        obst.adjustSize(
            this.name, 
            roundW,
            roundH,
            roundX, 
            roundY
        );

        opts.obstacleList();

        obst.selectObstacle(null);
    });

    // Action for the plus and minus buttons
    $('.plusminus').click(function () {

        var inputEle = this.parentNode.firstChild.nextSibling.nextSibling,
            inputVal = parseInt(inputEle.value),
            intention = this.value,

            /**
             *  Magic math function
             *  sauce: http://stackoverflow.com/questions/13077923/how-can-i-convert-a-string-into-a-math-operator-in-javascript
            **/
            matIt = {
                '+': function (x, y) { return x + y; },
                '-': function (x, y) { return x - y; }
            },
            changed = matIt[intention](inputVal, 10);
            changed = (changed < 0) ? 0 : changed;

        inputEle.value = changed;
    });

    // Action for the button to create a title on the paper.
    $('#titleSubmit').click(function () {

        opts.setTitle();
    });

    // Prevent the default 'submit form' when enter-button is pressed(this refreshes the page),
    // but apply the input-text to the title.
    $('#titleText').keypress(function (e) {

        if (e.which == 13) {
            e.preventDefault();
            this.blur();
            opts.setTitle();
        }
    });
};

/**
 * Functionality that displays the 'projectname' that the user has entered on our paper.
 * Since it`s added as an svg-element, this will also be visible when the image is saved.
**/
Options.prototype.setTitle = function() {

    // Get the text from the html-element, and update it.
    var titleEle = document.getElementById('titleText'),
        grid = TFplanner.grid,
        drawWidth = (grid.resWidth + 201),
        rectX = null,
        rectY = 12,
        areaY = null,
        rectLen = null,
        rectH = 30,
        textX = (drawWidth / 2),
        textY = 25,

        /**
         * This function shows title and its rectangle in the right order.
         * @param obj - The options-object, sent as 'this'.
        **/
        setupTitle = function(obj) {

            // If titlerect and titletext exist (should be always).
            if (obj.titleRect != null && obj.titleText != null) {
                obj.titleRect.toFront();
                obj.titleText.toFront();

                // Incase areatext also exists
                if (obj.areaText != null) {
                    obj.areaText.toFront();
                }
            }
        };

    this.projectName = (titleEle != null) ? titleEle.value : this.projectName;

    // Clear the title-element if it already exist.
    this.titleText != null ? this.titleText.remove() : null;
    this.areaText != null ?  this.titleText.remove() : null;
    this.titleRect != null ? this.titleRect.remove() : null;           

    this.titleText = grid.paper.text(textX, textY, this.projectName).attr({
        'font-size': 20,
        'font-family': 'verdana',
        'font-style': 'oblique'
    });

    areaY = ((this.titleText.getBBox().height / 2) + 10 + textY);

    if (this.utilizeString != null) {
        this.areaText = grid.paper.text(textX, areaY, this.utilizeString).attr({
            'font-size': 14,
            'font-family': 'verdana',
            'font-style': 'oblique'
        });

        rectH += (this.areaText.getBBox().height); 
    }

    // Dynamic size of the rectangle surrounding the text.
    rectLen = (this.titleText.getBBox().width + 30);
    rectX = (textX - (rectLen / 2));

    this.titleRect = grid.paper.rect(rectX, rectY, rectLen, rectH, 5, 5).attr({
        opacity: 1,
        fill: 'white'
    });

    setupTitle(this);
};

/** 
 * Function that creates a form that lets the user 
 * adjust lengths of his predifined room.
**/
Options.prototype.initDefine = function() {
    
    var preDefArr = this.preDefArr,
        defSubmit = 'defSubmit',
        wallsLength = (preDefArr != null) ? (preDefArr[1].length - 1) : null,
        finished = TFplanner.finishedRoom,
        // Starting with a clean slate @ the html variable.
        html = "";

    // Removing the svg paper and adding room class for background color
    this.optPaper.remove();

    $(this.container).addClass('roomTab');
    $(this.container).removeClass('obstacleTab');

    html += '<h3> Egendefiner m'+this.dotA+'l </h3>';

    // If preDef is assigned, list the walls and let the user input stuff, YO.
    if (preDefArr != null) {

        html += '<form class=forms>';

        for (var i = 0; i < wallsLength; i++) {
            
            html += "<span>Vegg "+(i+1)+": <input type='number' class='inputt' id=wall"+i+" value="+preDefArr[1][i];
            html += "></span><br>";
        }

        // Add last wall disabled input
        html += "<span class='inputt'>Vegg "+(wallsLength + 1)+" :";
        html += "<input type='text' id=wall"+wallsLength+" value='Automatisk' disabled='disabled'></span><br>";

        html += "<input id="+defSubmit+" type='button' value='Oppdater'>";
        html += "</form>";

    } else {
        html = '<p class="error"> You need to select<br> a predefined room first! </p>';
    }

    // Add html to container.
    $(this.container).html(html);

    // Add click action for the "submit button".
    $('#'+defSubmit).click(function() {

        // Goes through the input elements and stores the length
        for (var i = 0; i < wallsLength; i++) {
            preDefArr[1][i] = $('#wall'+i).val();
        }
        // Remove previous measurements, remove the selectwall 
        // and finally create the new room with specifications.
        TFplanner.measurement.deconstructAid();
        finished.selectWall();
        TFplanner.ourRoom.createRoom(preDefArr);
    });


    /**
     * Functionality that signals what wall that is selected when typing into the input field.
    **/
    $('.inputt').mousedown(function() {

        var child = $(this).children(),
            // Sort out id of input field (should be same as wall id).
            id = (child[0] != null) ? child[0].id : child.context.id;

        // Get wall ID.
        id = id.slice(-1);

        // If the last wall-index is targeted we unselect.
        id != wallsLength ? finished.selectWall(id) : finished.selectWall(null);
    });

    
    // Pretty much the same as previous function, but this one handles 'keydown' in the inputfield
    $('.inputt').keydown(function (e) {

        // Handling actions when 'Tab' is pressed in the input-field(s).
        if (e.keyCode == 9) { 

            var child = $(this).children(),
                id = (child[0] != null) ? child[0].id : child.context.id;

            // Get wall ID, and add increment with 1, since we tabbed from the previous wall.
            id = id.slice(-1);
            id++;

            // If the last wall-index is targeted when tab is pressed, we unselect.
            id != wallsLength ? finished.selectWall(id) : finished.selectWall(null);
        } 
    });
};

/*
 * Sets up the 'options-container', and create buttons and handlers.
 * Basically the same is done for each button, but the coordinates is different for each one.
 * OBS: The order of pushing elements to collections is important! (The button must be pushed as first element)
**/
Options.prototype.initDraw = function() {

    var paper = this.optPaper,
        opts = this,
        width = paper.width,
        height = paper.height,
        drawColl = paper.set(),        
        rectColl = paper.set(),
        tColl = paper.set(),
        lColl = paper.set(),
        lInvColl = paper.set(),
        lRot180Coll = paper.set(),
        lRot270Coll = paper.set(),
        tRot90Coll = paper.set(),
        tRot180Coll = paper.set(),
        tRot270Coll = paper.set(),
        uColl = paper.set(),
        // Attributes for the "background-square" of buttons.
        rectAttr = {                
            fill: this.defColor, 
            stroke: this.defColor, 
            'stroke-width': 1, 
        },
        // Attributes for the "image" on each button.
        imgAttr = {                 
            fill: this.imgColor,
            stroke: 'black',
            'stroke-width': 1,
        },
        txtAttr = {
            'font-size': 18,
            'font-weight': 'bold'
        },


    /**
     * All buttons is created the same way, with a square behind a illustration of the room-shape.
     * Here are some common variables for positioning:
    **/ 

    // each "column" has its own x variable.
    x0 = (width / 2.665),
    x1 = (width / 8),
    x2 = (width * (5 / 8)),
    x3 = (width / 2),

    // Each row has its own y variable.
    y0 = (height * (4 / 20)),
    y1 = (height * (5 / 20)),
    y2 = (height * (9 / 20)),
    y3 = (height * (10 / 20)),
    y4 = (height * (12 / 20)),
    y5 = (height * (14 / 20)),
    y6 = (height * (16 / 20)),
    y7 = (height * (18 / 20)),
    
    // Basically different offsets and points
    w = (width / 4),
    offset1 = (w / 4),
    offset2 = (w / 2),
    offset3 = (3 / 4),
    offset4 = (w / 3),
    offset5 = (w / 6),
    offset6 = (w * (7 / 12)),
    offset7 = (w * (5 / 12)),
    offset8 = (w / 2),
    p0 = (width * (7 / 16)),
    p1 = (width * (3 / 16)),
    p2 = (width * (11 / 16)),

    // CUSTOM DRAW
    // Header
    drawTxt = paper.text(x3, y0, 'Tegn selv').attr(txtAttr),

    // Button
    drawRect = paper.rect(x0, y1, w, w).attr(rectAttr),
    drawImg = paper.path(
                'M'+(p0)+' '+((y1)+offset1)+
                ' L'+((p0)+offset2)+' '+((y1)+(w*offset3))+
                ' L'+(p0)+' '+((y1)+(w*offset3))+
                ' L'+(p0)+' '+((y1)+offset1)
            ).attr(imgAttr),

    // PREDEFINED DRAW
    // Header
    tabTxt = paper.text(x3, y2, 'Ferdiglagde rom').attr(txtAttr),

    // FIRST ROW of buttons
    buttonRect = paper.rect(x1, y3, w, w).attr(rectAttr),
    rectImg = paper.rect(p1, (y3+offset1), offset2, offset2).attr(imgAttr),

    buttonL = paper.rect(x2, y3, w, w).attr(rectAttr),
    lImg = paper.path(
                'M'+p2+' '+(y3+offset1)+
                ' L'+(p2+offset1)+' '+(y3+offset1)+
                ' L'+(p2+offset1)+' '+(y3+offset2)+
                ' L'+(p2+offset2)+' '+(y3+offset2)+
                ' L'+(p2+offset2)+' '+(y3+(w*offset3))+
                ' L'+p2+' '+(y3+(w*offset3))+
                ' L'+p2+' '+(y3+offset1)
            ).attr(imgAttr),


    // SECOND ROW
    buttonT = paper.rect(x1, y4, w, w).attr(rectAttr),
    tImg = paper.path(
                'M'+p1+' '+(y4+offset1)+
                'L'+(p1+offset2)+' '+(y4+offset1)+
                ' L'+(p1+offset2)+' '+(y4+offset2)+
                ' L'+(p1+offset4)+' '+(y4+offset2)+
                ' L'+(p1+offset4)+' '+(y4+(w*offset3))+
                ' L'+(p1+offset5)+' '+(y4+(w*offset3))+
                ' L'+(p1+offset5)+' '+(y4+offset2)+
                ' L'+p1+' '+(y4+offset2)+
                ' L'+p1+' '+(y4+offset1)
            ).attr(imgAttr),

    lInv = paper.rect(x2, y4, w, w).attr(rectAttr),
    lInvImg = paper.path(
                'M'+(p2+offset1)+' '+(y4+offset1)+
                ' L'+(p2+offset2)+' '+(y4+offset1)+
                ' L'+(p2+offset2)+' '+(y4+(w*offset3))+
                ' L'+p2+' '+(y4+(w*offset3))+
                ' L'+p2+' '+(y4+offset2)+
                ' L'+(p2+offset1)+' '+(y4+offset2)+
                ' L'+(p2+offset1)+' '+(y4+offset1)
            ).attr(imgAttr),

    // THIRD ROW!
    tRot90 = paper.rect(x1, y5, w, w).attr(rectAttr),
    tRot90Img = paper.path(
                'M'+(p1+offset1)+' '+(y5+offset1)+
                ' L'+(p1+offset2)+' '+(y5+offset1)+
                ' L'+(p1+offset2)+' '+(y5+(w*offset3))+
                ' L'+(p1+offset1)+' '+(y5+(w*offset3))+
                ' L'+(p1+offset1)+' '+(y5+offset6)+
                ' L'+p1+' '+(y5+offset6)+
                ' L'+p1+' '+(y5+offset7)+
                ' L'+(p1+offset1)+' '+(y5+offset7)+
                ' L'+(p1+offset1)+' '+(y5+offset1)
            ).attr(imgAttr),

    lRot180 = paper.rect(x2, y5, w, w).attr(rectAttr),
    lRot180Img = paper.path(
                'M'+p2+' '+(y5+offset1)+
                ' L'+(p2+offset2)+' '+(y5+offset1)+
                ' L'+(p2+offset2)+' '+(y5+(w*offset3))+
                ' L'+(p2+offset1)+' '+(y5+(w*offset3))+
                ' L'+(p2+offset1)+' '+(y5+offset2)+
                ' L'+p2+' '+(y5+offset2)+
                ' L'+p2+' '+(y5+offset1)
            ).attr(imgAttr),


    // FOURTH ROW!
    lRot270 = paper.rect(x2, y6, w, w).attr(rectAttr),
    lRot270Img = paper.path(
                'M'+p2+' '+(y6+offset1)+
                ' L'+(p2+offset2)+' '+(y6+offset1)+
                ' L'+(p2+offset2)+' '+(y6+offset2)+
                ' L'+(p2+offset1)+' '+(y6+offset2)+
                ' L'+(p2+offset1)+' '+(y6+(w*offset3))+
                ' L'+p2+' '+(y6+(w*offset3))+
                ' L'+p2+' '+(y6+offset1)
            ).attr(imgAttr),

    
    tRot180 =  paper.rect(x1, y6, w, w).attr(rectAttr),
    tRot180Img = paper.path(
                'M'+(p1+offset5)+' '+(y6+offset1)+
                ' L'+(p1+offset4)+' '+(y6+offset1)+
                ' L'+(p1+offset4)+' '+(y6+offset2)+
                ' L'+(p1+offset2)+' '+(y6+offset8)+
                ' L'+(p1+offset2)+' '+(y6+(w*offset3))+
                ' L'+p1+' '+(y6+(w*offset3))+
                ' L'+p1+' '+(y6+offset8)+
                ' L'+(p1+offset5)+' '+(y6+offset8)+
                ' L'+(p1+offset5)+' '+(y6+offset1)
            ).attr(imgAttr),


    // FIFTH ROW!
    tRot270 = paper.rect(x1, y7, w, w).attr(rectAttr),
    tRot270Img = paper.path(
                'M'+p1+' '+(y7+offset1)+
                ' L'+(p1+offset1)+' '+(y7+offset1)+
                ' L'+(p1+offset1)+' '+(y7+offset7)+
                ' L'+(p1+offset2)+' '+(y7+offset7)+
                ' L'+(p1+offset2)+' '+(y7+offset6)+
                ' L'+(p1+offset1)+' '+(y7+offset6)+
                ' L'+(p1+offset1)+' '+(y7+(w*offset3))+
                ' L'+p1+' '+(y7+(w*offset3))+
                ' L'+p1+' '+(y7+offset1)
            ).attr(imgAttr),

    
    buttonU = paper.rect(x2, y7, w, w).attr(rectAttr),
    uImg = paper.path(
                'M'+p2+' '+(y7+offset1)+
                ' L'+(p2+offset5)+' '+(y7+offset1)+
                ' L'+(p2+offset5)+' '+(y7+offset2)+
                ' L'+(p2+offset4)+' '+(y7+offset2)+
                ' L'+(p2+offset4)+' '+(y7+offset1)+
                ' L'+(p2+offset2)+' '+(y7+offset1)+
                ' L'+(p2+offset2)+' '+(y7+(w*offset3))+
                ' L'+p2+' '+(y7+(w*offset3))+
                ' L'+p2+' '+(y7+offset1)
            ).attr(imgAttr),

    /**
     * This function add the mouse-handlers for all the 'premade-room'-buttons.
     * @param Coll - A set, containing the rectangular button and the image upon it.
     * @param val - An int, that says what roomtype to be sent to the 'createRoom' function.
     * @param toolTip - A string, that is used to set the tooltip(title) of each button.
    **/
    createHandlers = function(coll, val, toolTip) {

        var theRoom = TFplanner.ourRoom,
            defColor = opts.defColor,
            inColor = opts.inColor;

        coll.attr({
            cursor: 'pointer',
            title: toolTip
        }).hover(function () {
            // Set attributes on hover.
            coll[0].attr('fill', inColor);
        }, function () {
            coll[0].attr('fill', defColor);

        }).mouseup(function () {

            if (val != null) {
                TFplanner.measurement.deconstructAid();
                theRoom.createRoom(opts.preDefRoom(val));
            } else {
                if (TFplanner.finishedRoom == null) {
                    theRoom.initRoom();
                }
            }
        });
    };

    // Set backgroundcolor of the options-container canvas.
    paper.canvas.style.backgroundColor = '#CBC4BC';

    // Create handlers and stuff for all the 'buttons'.
    createHandlers(drawColl.push(drawRect, drawImg), null, 'Tegn selv!');
    createHandlers(rectColl.push(buttonRect, rectImg), 0, 'Ferdiglaget kvadratisk rom');
    createHandlers(tColl.push(buttonT, tImg), 2, 'Ferdiglaget T-formet rom');
    createHandlers(lColl.push(buttonL, lImg), 1, 'Ferdiglaget L-formet rom');
    createHandlers(lInvColl.push(lInv, lInvImg), 5, 'Ferdiglaget invertert L-rom');
    createHandlers(lRot180Coll.push(lRot180, lRot180Img), 4, 'Ferdiglaget L-rom');
    createHandlers(lRot270Coll.push(lRot270, lRot270Img), 3, 'Ferdiglaget L-rom');
    createHandlers(tRot90Coll.push(tRot90, tRot90Img), 6, 'Ferdiglaget T-rom');
    createHandlers(tRot180Coll.push(tRot180, tRot180Img), 7, 'Ferdiglaget T-rom');
    createHandlers(tRot270Coll.push(tRot270, tRot270Img), 8, 'Ferdiglaget T-rom');
    createHandlers(uColl.push(buttonU, uImg), 9, 'Ferdiglaget U-rom');

};

/**
 * Function that holds the shapes and wall-lengths of 'predefined' rooms.
 * All drawing will be done clockwise and will follow the angle-axis predefined. 
 * (180 is straight to the right, 270 is downwards etc.).
 * The first array contain the angles, and the second array contain the length of the wall.
 * @param {int} value - A number from the function that calls this one, defines what room is to be returned.
**/
Options.prototype.preDefRoom = function(value) {

    switch(value) {
        case 0:  //Rectangle-shaped
            return [[180, 270, 360, 90],[600, 400, 600, 400]];                                           
        case 1: //L-shaped
            return [[180, 270, 180, 270, 360, 90],[200, 200, 200, 150, 400, 350]];                           
        case 2: //T-shaped
            return [[180, 270, 360, 270, 360, 90, 360, 90],[450, 150, 150, 250, 150, 250, 150, 150]];        
        case 3: //L-shape rotated 270 degrees.
            return [[180, 270, 360, 270, 360, 90],[400, 150, 200, 200, 200, 350]];                        
        case 4: //L-shape rotated 180 degrees.
            return [[180, 270, 360, 90, 360, 90], [400, 350, 200, 200, 200, 150]];                        
        case 5: //L-shape rotated 90 degrees.
            return [[180, 270, 360, 90, 180, 90],[200, 350, 400, 150, 200, 200]];                          
        case 6: //T-shape rotated 90 degrees.
            return [[180, 270, 360, 90, 360, 90, 180, 90], [150, 450, 150, 150, 250, 150, 250, 150,]];     
        case 7: //T-shape rotated 180 degrees.
            return [[180, 270, 180, 270, 360, 90, 180, 90], [150, 250, 150, 150, 450, 150, 150, 250]];    
        case 8: //T-shape rotated 270 degrees.
            return [[180, 270, 180, 270, 360, 270, 360, 90], [150, 150, 250, 150, 250, 150, 150, 450]];   
        case 9: //U-shaped room
            return [[180, 270, 180, 90, 180, 270, 360, 90],[150, 200, 200, 200, 150, 350, 500, 350]];       
    }
};

/**
 * Function that get the value from all dropdowns in the Specifications-tab
 * and find the corresponding product that fit the chosen values.
 *
 * The choices made in "specifications" depends on the describing values
 * "areas", "climates", "decks", "wattage" and "casting" for choosing valid mat.
 * 
 * Examples:
 *
 * Mat that is only valid outside:
 * "climates: {
 *      outside: true
 *  }"
 *
 * Mat that is valid outside and inside:
 * "climates: {
 *      undefined: true
 *  }"
**/
Options.prototype.tfProducts = function() {

    var area = $('#inOutType').val(),
        climate = $('#climateType').val(),
        deck = $('#deckType').val(),
        watt = $('#wattage').val(),
        cast = $('#casting').val(),

        mats = [
        {
            name: 'TFP',
            areas: {
                inside: true
            },

            climates: {
                dry: true
            },

            decks: {
                parquet: true,
                laminat: true
            },

            wattage: {
                '60': true
            },

            casting: {
                nocast: true
            },

            note: 'Husk '+this.dotA+' bestille nok TFP underlagsmatte, tape og termostat med gulvf'+this.crossO+'ler',

            desc: 'Varmekabelmatte som parkettunderlag',

            products: [
                {
                    length: 2,
                    number: 1001051,
                    name: 'TFP 60W/1,0m2 0,5x2m 60W',
                }, {
                    length: 4, 
                    number: 1001052,
                    name: 'TFP 60W/2,0m2 0,5x4m 120W'
                }, {
                    length: 6, 
                    number: 1001053,
                    name: 'TFP 60W/3,0m2 0,5x6m 180W'
                }, {
                    length: 8, 
                    number: 1001054,
                    name: 'TFP 60W/4,0m2 0,5x8m 240W'
                }, {
                    length: 10, 
                    number: 1001055,
                    name: 'TFP 60W/5,0m2 0,5x10m 300W'
                }, {
                    length: 12, 
                    number: 1001056,
                    name: 'TFP 60W/6,0m2 0,5x12m 360W'
                }, {
                    length: 14, 
                    number: 1001057,
                    name: 'TFP 60W/7,0m2 0,5x14m 420W'
                }, {
                    length: 16, 
                    number: 1001058,
                    name: 'TFP 60W/8,0m2 0,5x16m 480W'
                }, {
                    length: 18, 
                    number: 1001059,
                    name: 'TFP 60W/9,0m2 0,5x18m 540W'
                }, {
                    length: 20, 
                    number: 1001060,
                    name: 'TFP 60W/10,0m2 0,5x20m 600W'
                }, {
                    length: 24, 
                    number: 1001062,
                    name: 'TFP 60W/12,0m2 0,5x24m 720W'
                }, {
                    length: 30,
                    number: 1001063,
                    name: 'TFP 60W/15,0m2 0,5x30m 900W'
                }
            ]
        }, {
            name: 'TFU',
            areas: {
                outside: true
            },
            // Might be ugly to set undefined as 'true', but climate will not be defined if area is outside, so
            // it works.
            climates: {
                undefined: true
            },

            decks: {
                asphalt: true
            },

            wattage: {
                undefined: true
            },

            casting: {
                undefined: true
            },  

            note: 'Husk '+this.dotA+' bestille styringssystem som passer anlegget.<br> Sp'+this.crossO+'r Thermo-Floor om r'+this.dotA+'d hvis du er usikker p'+this.dotA+' hva som kan brukes.',

            desc: 'Utend'+this.crossO+'rs varmekabelmatte',

            products: [
                {
                    length: 2,
                    number: 1001151,
                    name: 'TFU 230V 300W/1m2 - 300W'
                }, {
                    length: 4, 
                    number: 1001152,
                    name: 'TFU 230V 300W/2m2 - 600W'
                }, {
                    length: 6, 
                    number: 1001153,
                    name: 'TFU 230V 300W/3m2 - 900W'
                }, {
                    length: 8, 
                    number: 1001154,
                    name: 'TFU 230V 300W/4m2 - 1200W'
                }, {
                    length: 10, 
                    number: 1001155,
                    name: 'TFU 230V 300W/5m2 - 1500W'
                }, {
                    length: 12, 
                    number: 1001156,
                    name: 'TFU 230V 300W/6m2 - 1800W'
                }, {
                    length: 14, 
                    number: 1001157,
                    name: 'TFU 230V 300W/7m2 - 2100W'
                }, {
                    length: 16, 
                    number: 1001158,
                    name: 'TFU 230V 300W/8m2 - 2400W'
                }, {
                    length: 20, 
                    number: 1001160,
                    name: 'TFU 230V 300W/10m2 - 3000W'
                }, {
                    length: 24, 
                    number: 1001162,
                    name: 'TFU 230V 300W/12m2 - 3600W'
                }, {
                    length: 28, 
                    number: 1001164,
                    name: 'TFU 230V 300W/14m2 - 4200W'
                }
            ]
        }, {
            name: 'SVK/TFU',
            areas: {
                outside: true
            },

            climates: {
                undefined: true
            },

            decks: {
                pavblock: true,
                concrete: true
            },

            wattage: {
                undefined: true
            },

            casting: {
                undefined: true
            },

            note: 'Husk '+this.dotA+' bestille styringssystem som passer anlegget.<br> Sp'+this.crossO+'r Thermo-Floor om r'+this.dotA+'d hvis du er usikker p'+this.dotA+' hva som kan brukes.',

            desc: 'Utend'+this.dotA+'rs varmekabelmatte',

            products: [
                {
                    length: 2,
                    number: 1001151,
                    name: 'TFU 230V 300W/1m2 - 300W'
                }, {
                    length: 4, 
                    number: 1001152,
                    name: 'TFU 230V 300W/2m2 - 600W'
                }, {
                    length: 6, 
                    number: 1001153,
                    name: 'TFU 230V 300W/3m2 - 900W'
                }, {
                    length: 8, 
                    number: 1001154,
                    name: 'TFU 230V 300W/4m2 - 1200W'
                }, {
                    length: 10, 
                    number: 1001155,
                    name: 'TFU 230V 300W/5m2 - 1500W'
                }, {
                    length: 12, 
                    number: 1001156,
                    name: 'TFU 230V 300W/6m2 - 1800W'
                }, {
                    length: 14, 
                    number: 1001157,
                    name: 'TFU 230V 300W/7m2 - 2100W'
                }, {
                    length: 16, 
                    number: 1011638,
                    name: 'TF SVK MATTE 2400W'
                }, {
                    length: 20, 
                    number: 1011640,
                    name: 'TF SVK MATTE 3000W'
                }, {
                    length: 24, 
                    number: 1011642,
                    name: 'TF SVK MATTE 3600W'
                }
            ]
        }, {
            name: 'TF STICKY MAT 60W',
            areas: {
                inside: true
            },

            climates: {
                dry: true,
                wet: true
            },

            decks: {
                tile: true,
                parquet: true,
                laminat: true,
                carpet: true,
                cork: true,
                scale: true,
                concrete: true
            },

            wattage: {
                '60': true,
                undefined: true
            },

            casting: {
                cast: true,
                undefined: true
            },

            note: 'Husk '+this.dotA+' bestille primer, st'+this.dotA+'lnett og termostat med gulvf'+this.crossO+'ler.',

            desc: 'TF Sticky selvklebende varmekabelmatte',

            products: [
                { 
                    length: 6,
                    number: 1011503,
                    name: 'TF Sticky Mat 60W/3m2 - 180W'
                }, {
                    length: 8, 
                    number: 1011504,
                    name: 'TF Sticky Mat 60W/4m2 - 240W'
                }, {
                    length: 10, 
                    number: 1011505,
                    name: 'TF Sticky Mat 60W/5m2 - 300W'
                }, {
                    length: 12, 
                    number: 1011506,
                    name: 'TF Sticky Mat 60W/6m2 - 360W'
                }, {
                    length: 14, 
                    number: 1011507,
                    name: 'TF Sticky Mat 60W/7m2 - 420W'
                }, {
                    length: 16, 
                    number: 1011508,
                    name: 'TF Sticky Mat 60W/8m2 - 480W'
                }, {
                    length: 18, 
                    number: 1011509,
                    name: 'TF Sticky Mat 60W/9m2 - 540W'
                }, {
                    length: 20, 
                    number: 1011510,
                    name: 'TF Sticky Mat 60W/10m2 - 600W'
                }, {
                    length: 24, 
                    number: 1011512,
                    name: 'TF Sticky Mat 60W/12m2 - 720W'
                }
            ]
        }, {
            name: 'TF STICKY MAT 100W',
            areas: {
                inside: true
            },

            climates: {
                dry: true,
                wet: true
            },

            decks: {
                tile: true,
                parquet: true,
                laminat: true,
                carpet: true,
                cork: true,
                scale: true,
                concrete: true
            },

            wattage: {
                '100': true,
                undefined: true
            },

            casting: {
                undefined: true
            },

            note: 'Husk '+this.dotA+' bestille primer, st'+this.dotA+'lnett og termostat med gulvf'+this.crossO+'ler.',

            desc: 'TF Sticky selvklebende varmekabelmatte',

            products: [
                { 
                    length: 6,
                    number: 1011513,
                    name: 'TF Sticky Mat 100W/3m2 - 300W'
                }, {
                    length: 8, 
                    number: 1011514,
                    name: 'TF Sticky Mat 100W/4m2 - 400W'
                }, {
                    length: 10, 
                    number: 1011515,
                    name: 'TF Sticky Mat 100W/5m2 - 500W'
                }, {
                    length: 12, 
                    number: 1011516,
                    name: 'TF Sticky Mat 100W/6m2 - 600W'
                }, {
                    length: 14, 
                    number: 1011517,
                    name: 'TF Sticky Mat 100W/7m2 - 700W'
                }, {
                    length: 16, 
                    number: 1011518,
                    name: 'TF Sticky Mat 100W/8m2 - 800W'
                }, {
                    length: 18, 
                    number: 1011519,
                    name: 'TF Sticky Mat 100W/9m2 - 900W'
                }, {
                    length: 20, 
                    number: 1011520,
                    name: 'TF Sticky Mat 100W/10m2 - 1000W'
                }, {
                    length: 24, 
                    number: 1011522,
                    name: 'TF Sticky Mat 100W/12m2 - 1200W'
                }
            ]
        }, {
            name: 'TF STICKY MAT 130W',
            areas: {
                inside: true
            },

            climates: {
                dry: true,
                wet: true
            },

            decks: {
                tile: true,
                parquet: true,
                laminat: true,
                carpet: true,
                cork: true,
                scale: true,
                concrete: true
            },

            wattage: {
                '130': true,
                undefined: true
            },

            casting: {
                undefined: true
            },

            note: 'Husk '+this.dotA+' bestille primer, st'+this.dotA+'lnett og termostat med gulvf'+this.crossO+'ler.',

            desc: 'TF Sticky selvklebende varmekabelmatte',

            products: [
                { 
                    length: 6,
                    number: 1011523,
                    name: 'TF Sticky Mat 130W/3m2 - 390W'
                }, {
                    length: 8, 
                    number: 1011524,
                    name: 'TF Sticky Mat 130W/4m2 - 520W'
                }, {
                    length: 10, 
                    number: 1011525,
                    name: 'TF Sticky Mat 130W/5m2 - 650W'
                }, {
                    length: 12, 
                    number: 1011526,
                    name: 'TF Sticky Mat 130W/6m2 - 780W'
                }, {
                    length: 14, 
                    number: 1011527,
                    name: 'TF Sticky Mat 130W/7m2 - 910W'
                }, {
                    length: 16, 
                    number: 1011528,
                    name: 'TF Sticky Mat 130W/8m2 - 1040W'
                }, {
                    length: 18, 
                    number: 1011529,
                    name: 'TF Sticky Mat 130W/9m2 - 1170W'
                }, {
                    length: 20, 
                    number: 1011550,
                    name: 'TF Sticky Mat 130W/10m2 - 1300W'
                }, {
                    length: 24, 
                    number: 1011552,
                    name: 'TF Sticky Mat 130W/12m2 - 1560W'
                }
            ]
        }, {
            name: 'TF STICKY MAT 160W',
            areas: {
                inside: true
            },

            climates: {
                dry: true,
                wet: true
            },

            decks: {
                tile: true,
                parquet: true,
                laminat: true,
                carpet: true,
                cork: true,
                scale: true,
                concrete: true
            },

            wattage: {
                '160': true,
                undefined: true
            },

            casting: {
                undefined: true
            },

            note: 'Husk '+this.dotA+' bestille primer, st'+this.dotA+'lnett og termostat med gulvf'+this.crossO+'ler.',

            desc: 'TF Sticky selvklebende varmekabelmatte',

            products: [
                { 
                    length: 2,
                    number: 1011530,
                    name: 'TF Sticky Mat 160W/1m2 - 160W'
                }, {
                    length: 3, 
                    number: 1011531,
                    name: 'TF Sticky Mat 160W/1,5m2 - 240W'
                }, {
                    length: 4, 
                    number: 1011532,
                    name: 'TF Sticky Mat 160W/2m2 - 320W'
                }, {
                    length: 5, 
                    number: 1011533,
                    name: 'TF Sticky Mat 160W/2,5m2 - 400W'
                }, {
                    length: 6, 
                    number: 1011534,
                    name: 'TF Sticky Mat 160W/3m2 - 480W'
                }, {
                    length: 7, 
                    number: 1011535,
                    name: 'TF Sticky Mat 160W/3,5m2 - 560W'
                }, {
                    length: 8, 
                    number: 1011536,
                    name: 'TF Sticky Mat 160W/4m2 - 640W'
                }, {
                    length: 9, 
                    number: 1011537,
                    name: 'TF Sticky Mat 160W/4,5m2 - 720W'
                }, {
                    length: 10, 
                    number: 1011538,
                    name: 'TF Sticky Mat 160W/5m2 - 800W'
                }, {
                    length: 12, 
                    number: 1011540,
                    name: 'TF Sticky Mat 160W/6m2 - 960W'
                }, {
                    length: 14, 
                    number: 1011542,
                    name: 'TF Sticky Mat 160W/7m2 - 1120W'
                }, {
                    length: 16, 
                    number: 1011544,
                    name: 'TF Sticky Mat 160W/8m2 - 1280W'
                }, {
                    length: 18, 
                    number: 1011546,
                    name: 'TF Sticky Mat 160W/9m2 - 1440W'
                }
            ]
        },
    ];

    var i = mats.length;
    while (i--) {
        if (mats[i].areas[area] && mats[i].climates[climate] && mats[i].decks[deck] && mats[i].wattage[watt] && mats[i].casting[cast]) {

            this.validMat = mats[i];
        }
    }
};

/**
 * @class Displaying different measurements for the room.
 * This include angles, wall-lengths etc.
**/
function Measurement () {
    this.paper = TFplanner.grid.paper;
    this.measurements = this.paper.set();
}

/**
 *  Measurement variables.
**/
Measurement.prototype.inverted = null;
Measurement.prototype.fontsize = null;

/**
 *  array storing temporary angle measurements used while drawing, and the wallid related
**/
Measurement.prototype.tmpAngle = null;
/**
 *  This array stores elements for length measurement. DO REMEMBER TO EMPTY IT BEFORE NEW ROOM, also make it available for toFront() ?!
**/
Measurement.prototype.lengthAid = [];

/**
 *  This array stores the elements showing the angle measurement. have it do the same as the array above regarding toFront().
**/
Measurement.prototype.angleAid = [];
/**
 *  "Deconstructor" for the aids, removing the containing elements of the arrays, and finally pop'ing the arrays.
**/
Measurement.prototype.deconstructAid = function() {

    var i = this.lengthAid.length,
        j = this.angleAid.length;

    while (i--) {
        this.lengthAid[i][1].remove();
        this.lengthAid[i][2].remove();
        this.lengthAid[i][3].remove();
        this.lengthAid[i][4].remove();
        this.lengthAid[i][5].remove();
        this.lengthAid.pop();
    }

    while (j--) {
        this.angleAid[j][1].remove();
        this.angleAid[j][2].remove();
        this.angleAid.pop();
    }
}; 

/**
 *  Function that removes angles and its text visually and inside the array
**/
Measurement.prototype.finalMeasurements = function() {

    var i = this.lengthAid.length,
        angles = (this.angleAid.length > 0);

    while(i--) {
        this.lengthAid[i][1].toFront();
        this.lengthAid[i][2].toFront();
        this.lengthAid[i][3].toFront();
        this.lengthAid[i][4].toFront();
        this.lengthAid[i][5].toFront();

        if (angles) {
            this.angleAid[i][1].remove();
            this.angleAid[i][2].remove();
            this.angleAid.pop();
        }
    }
};

/**
 * Function that renews the measurements visualized.
 * This function should be called each time paths are drawn / changed.
 * Goes through all walls and calls length and angle 
 * functions with appropriate variables.
**/
Measurement.prototype.refreshMeasurements = function() {

    var theRoom = TFplanner.ourRoom,
        walls = theRoom.walls,
        finished = theRoom.finished,
        len = walls.length,
        longestWall = null,
        currentWall,
        fontsize;

    this.measurements.remove();

    this.inverted = null;

    // Calculate text size of the measurements
    this.fontsize = 12;
    
    for (var i = 0; i < len; i++) {
        currentWall = walls[i].getTotalLength();

        if (longestWall != null) {
            if (longestWall <= currentWall) {
                longestWall = currentWall;
            }
        } else {
            longestWall = currentWall;
        }
    }

    fontsize = (longestWall)/100;
    fontsize = (fontsize * 1.4);

    if (fontsize > 12 && fontsize < 14) {
        fontsize = 12;
    }
    if (fontsize >= 14 && fontsize < 16) {
        fontsize = 14;
    }
    if (fontsize >= 16 && fontsize < 18) {
        fontsize = 16;
    } 
    if (fontsize >= 18) {
        fontsize = 18;
    }

    this.fontsize = (fontsize > this.fontsize) ? fontsize : this.fontsize;
    
    for (var i = 0; i < len; i++) {
        
        if (finished || i >= 1) {
            this.angleMeasurement(i);
        }

        this.lengthMeasurement(walls[i]);   
    }      
};

/**
 * Measure the angles between the different walls
 * @param {int} index - Index of a wall, needed to find its neighbours 
 * @param {Path} overload - 
 * @return angle - Angle for our measurementValues array.
**/
Measurement.prototype.angleMeasurement = function(index, overload) {

    var theRoom = TFplanner.ourRoom,
        circleRad = (theRoom.radius * 2),
        angle,
        startAngle, 
        endAngle,
        diffAngle,
        inverted,
        halfCircleP1,
        halfCircleP2,
        halfCircle,
        p1, 
        p2, 
        p3 = [],
        that = this,
        hc,
        // Getting the connectin paths. using this variable in both hasmeasures and angleStep1
        connected = this.returnConnectingPaths(index),
        midPoint = function(point1, point2) {
            var x1 = point1.x,
                x2 = point2[1],
                y1 = point1.y,
                y2 = point2[2],
                x = ((x1 + x2) / 2),
                y = ((y1 + y2) / 2);

            return ({x: x, y: y});
        },
        idFailsafe = function () {
            var wlen;

            if (typeof connected[0] === 'undefined') {

                wlen = theRoom.walls.length;

                return theRoom.walls[wlen - 1].id;
            }

            return connected[0].id;
        },
        wallId = idFailsafe(),
        /**
         *  Function that creates a sector that will represent the angle of a corner.
         *  @param: centerX - center of the sector ("halfcircle")
         *  @param: centerY - center of the sector ("halfcircle")
         *  @param: p1 - outer edges of the sector
         *  @param: p2 - outer edges of the sector
         *  @param: angle
         *  @param: r - radius
        **/
        createSector = function (centerX, centerY, p1, p2, angle, r) {
            var big = (angle >= 180) ? 1 : 0,
                x1 = p1.x, 
                x2 = p2.x, 
                y1 = p1.y,
                y2 = p2.y,
                theRoom = TFplanner.ourRoom,
                strokeColor = ((angle < theRoom.minAngle || angle > theRoom.maxAngle) && !theRoom.finished) ? 'ff0000' : '2F4F4F';

            return TFplanner.grid.paper.path(['M', centerX, centerY, 'L', x1, y1, 'A', r, r, 0, big, 0, x2, y2, 'z']).attr({
                    fill: '#00000', 
                    stroke: strokeColor,
                    'stroke-width': 1,
                    'stroke-linecap': 'round'
                });
        },
        /**
         *  Check if there are measures stored for this wall.
         *  Goes through lengthAid set and looks for an entry with an id value equal to the ('previous') wall id.
        **/
        hasMeasures = function() {
            var i;

            if (overload != null) {

                if (that.tmpAngle != null) {
                    return that.tmpAngle;
                } else {
                    return false;
                }

            } else {
                i = that.angleAid.length;
                while (i--) {
                    if (that.angleAid[i][0] == wallId) {
                        return that.angleAid[i];
                    }
                }
                return false;
            }
        },
        /**
         * Logic that determines the points used for creating the angle measurements.
        **/
        angleStep1 = function() {

            var walls = theRoom.walls,
                index = (walls.length - 1);

            if (overload == null) {

                p1 = connected[0].attrs.path[0];
                p2 = connected[0].attrs.path[1];
                p3 = connected[1].attrs.path[1];  

                // finding the points used for positioning the halfcircle.
                halfCircleP1 = connected[0].getPointAtLength((connected[0].getTotalLength() - circleRad));
                halfCircleP2 = connected[1].getPointAtLength(circleRad);

            } else {

                if (that.tmpMeasurements != null) {
                    that.tmpMeasurements.remove();
                    that.tmpMeasurements.clear();
                }

                p1 = walls[index].attrs.path[0];
                p2 = walls[index].attrs.path[1];
                p3 = overload.attrs.path[1];

                halfCircleP1 = walls[index].getPointAtLength((walls[index].getTotalLength() - circleRad));
                halfCircleP2 = overload.getPointAtLength(circleRad);
            }

            // Calculating the angle.
            angle = Raphael.angle(p1[1], p1[2], p3[1], p3[2], p2[1], p2[2]);

            // Need the start and ending angles between paths/points are needed for checking.
            startAngle = Raphael.angle(p1[1], p1[2], p2[1], p2[2]);
            endAngle = Raphael.angle(p2[1], p2[2], p3[1], p3[2]);

            diffAngle = endAngle - startAngle;

            // decides if the drawing is inverted or not
            if (that.inverted == null && overload == null) {
                that.inverted = (angle > 0 && angle < 180);
            }

            inverted = that.inverted; 
        },
        /**
         * Logic for calculating the  real angle
         * @param move - 
        **/
        angleStep2 = function(move) {

            if (inverted) {

                if (angle < 0) {
                    angle = 360 + angle;
                }
            
            } else {

                // Ensure that angle is positive.
                if (angle < 0) {
                    angle = angle * (-1);   
                }
              
                // angles that have an endangle larger and startangle larger than 180.
                if (endAngle >= 180) {

                    if (startAngle >= 180) {
                        angle = 360 - angle;

                    } else if (diffAngle < 180) {
                        angle = 360 - angle;
                    }

                // All angles that have endangles and startangles thar are smaller than 180, 
                // and also have a difference (diffangle) lower than -180.
                } else {

                    if (startAngle >= 180 && diffAngle < - 180) {
                        angle = 360 - angle;
                    }
                }
            }

            // Creating a new variable containing only two decimals and the degree char representing the angle in a string.
            var newAngle = angle.toFixed(1) + String.fromCharCode(176);

            /**
             *  real angle calculating done
            **/
            /**
             *  MOVE START!
            **/
            if (move !== false) {

                // Storing the halfcircle and text for readability.
                halfCircle = move[1];
                hc = move[2];
                textPoint = halfCircle.getPointAtLength((halfCircle.getTotalLength()/2));
                textPoint = midPoint(textPoint, p2);


                // move halfCircle
                var pathArray = halfCircle.attr('path'),
                    big = (angle >= 180) ? 1 : 0,
                    strokeColor = ((angle < theRoom.minAngle || angle > theRoom.maxAngle) && !theRoom.finished) ? 'ff0000' : '2F4F4F';

                // center coordinates
                pathArray[0][1] = p2[1];
                pathArray[0][2] = p2[2];

                // circle coordinates (basically where they start/end)
                // incase angle is inverted, swap places for P1 and P2.
                pathArray[1][1] = (inverted) ? halfCircleP1.x : halfCircleP2.x;
                pathArray[1][2] = (inverted) ? halfCircleP1.y : halfCircleP2.y;
                pathArray[2][6] = (inverted) ? halfCircleP2.x : halfCircleP1.x;
                pathArray[2][7] = (inverted) ? halfCircleP2.y : halfCircleP1.y;

                // big variable
                pathArray[2][4] = big;

                // updating the path array and setting the stroke color
                halfCircle.attr({
                    path: pathArray, 
                    stroke: strokeColor
                });
            
                // update hc text and position
                hc.attr({
                    text: newAngle,
                    x: textPoint.x,
                    y: textPoint.y
                });

            /**
             *  MOVE END.
            **/
            /**
             *  CREATE START!
            **/
            } else {

                if (!inverted) {
                    var tmp = halfCircleP2;
                    halfCircleP2 = halfCircleP1;
                    halfCircleP1 = tmp;
                }

                halfCircle = createSector(p2[1], p2[2], halfCircleP1, halfCircleP2, angle, circleRad);

                // only create the angle text if the halfcircle exists.
                if (halfCircle != null) {

                    textPoint = halfCircle.getPointAtLength((halfCircle.getTotalLength()/2));
                    textPoint = midPoint(textPoint, p2);

                    hc = that.paper.text(textPoint.x, textPoint.y, newAngle);
                }
            }
            /**
             *  CREATE END.
            **/
        };

    angleStep1(index);

    var moved = hasMeasures();

    angleStep2(moved);
    
    // either store as temporary measurements or proper ones.
    if (overload != null) {

        if (moved === false) {
            this.tmpAngle = [wallId, halfCircle, hc];
        }

    } else if (moved === false) {
        this.angleAid.push([wallId, halfCircle, hc]);
    }
    return angle;
};

/**
 * Function that creates a graphical representation of the walls length
 * @param {Path} wall -     
 * @return Wall-length for our measurementValues array.
**/
Measurement.prototype.lengthMeasurement = function (wall) {

    var theRoom = TFplanner.ourRoom,
        startP1 = wall.attrs.path[0],
        endP1 = wall.getPointAtLength(theRoom.radius),
        startP2 = wall.attrs.path[1],
        endP2 = wall.getPointAtLength((wall.getTotalLength() - theRoom.radius)),
        paper = this.paper,
        m1,
        m2,
        m3,
        m3r,
        m3t,
        // Coordinates of m3
        m31x,
        m31y,
        m32x,
        m32y,
        angle1,
        angle2,
        fontsize = this.fontsize,
        wallId = wall.id,
        lengthAid = this.lengthAid,
        currentAid = null,
        /**
         *  Check if there are measures stored for this wall.
         *  Goes through lengthAid set and looks for an entry with an id value equals to the current wall id.
         *  @param: id of the wall in question.
        **/
        hasMeasures = function(id) {

            for (var i = 0, ii = lengthAid.length; i < ii; i++) {

                if (lengthAid[i][0] == id) {
                    return lengthAid[i];
                }
            }
            return false;
        },
        /**
         *  Step one is creating or moving the supporting lines m1 and m2.
         *  @param: move boolean that tells to move or create.
        **/
        measuresStep1 = function(move) {

            var pathArray1,
                pathArray2;

            // moving the lines
            if (move !== false) {

                // Getting the lines in question for movement.
                m1 = move[1];
                m2 = move[2];

                pathArray1 = m1.attr('path');
                pathArray2 = m2.attr('path');

                // Changing coordinates of the paths
                pathArray1[0][1] = startP1[1];
                pathArray1[0][2] = startP1[2];
                pathArray1[1][1] = endP1.x;
                pathArray1[1][2] = endP1.y;

                pathArray2[0][1] = startP2[1];
                pathArray2[0][2] = startP2[2];
                pathArray2[1][1] = endP2.x;
                pathArray2[1][2] = endP2.y;

                m1.attr({path: pathArray1});
                m2.attr({path: pathArray2});

            // Creating lines when there is none.
            } else {

                m1 = paper.path('M'+startP1[1]+','+startP1[2]+'L'+endP1.x+','+endP1.y).attr({
                        fill: '#00000', 
                        stroke: '#2F4F4F',
                        'stroke-width': 1,
                        'stroke-linecap': 'round'
                    });

                m2 = paper.path('M'+startP2[1]+','+startP2[2]+'L'+endP2.x+','+endP2.y).attr({
                        fill: '#00000', 
                        stroke: '#2F4F4F',
                        'stroke-width': 1,
                        'stroke-linecap': 'round'
                    });
            }
        },
        /**
         *  Step 2 is creating the third supporting line and adding a text and rect.
         *  If this line, rect and text already exists - only move it.
        **/
        measuresStep2 = function(move) {

                // Creating the length text by converting the wall length to metres and adding a postfix "m".
            var len = (wall.getTotalLength() / 100).toFixed(2)+' m',
                // Calculating the middle of the path by using similar functinality as the middle function of drawRoom.
                textPointx = ((m31x + m32x) / 2),
                textPointy = ((m31y + m32y) / 2),
                rectLen,
                rectHeight, 
                rectY,
                rectX,
                pathArray;

            if (move !== false) {
                // Setting the elements regarding the third supportline, text and rect.
                m3 = move[3];
                m3r = move[4];
                m3t = move[5];

                // Storing path array of m3 supportline
                pathArray = m3.attr('path');

                // Changing coordinates of the path
                pathArray[0][1] = m31x;
                pathArray[0][2] = m31y;
                pathArray[1][1] = m32x;
                pathArray[1][2] = m32y;

                // updating path position
                m3.attr({path: pathArray});

                // updating text position and text.
                m3t.attr({
                    text: len,
                    x: textPointx,
                    y: textPointy
                });
               
                // Dynamic size of the rectangle surrounding the text.
                rectLen = (m3t.getBBox().width + 20);
                rectHeight = (m3t.getBBox().height);
                rectX = (textPointx - (rectLen / 2));
                rectY = (textPointy - (rectHeight / 2));

                // updating rect position
                m3r.attr({
                    x: rectX,
                    y: rectY,
                    width: rectLen,
                    height: rectHeight
                });

            } else {
                // Drawing the line paralell to the wall.        
                m3 = paper.path('M'+m31x+','+m31y+'L'+m32x+','+m32y).attr({
                        fill: '#00000', 
                        stroke: '#2F4F4F',
                        'stroke-width': 1,
                        'stroke-linecap': 'round'
                    });

                // Functionality that shows length and stuff
                // Adds text on top of the rectangle, to display the length of the wall.
                m3t = paper.text(textPointx, textPointy, len).attr({
                    opacity: 1,
                    'font-size': fontsize,
                    'font-family': 'verdana',
                    'font-style': 'oblique'
                });

                // Dynamic size of the rectangle surrounding the text.
                rectLen = (m3t.getBBox().width + 20);
                rectHeight = (m3t.getBBox().height);
                rectX = (textPointx - (rectLen / 2));
                rectY = (textPointy - (rectHeight / 2));

                // Draws a rectangle at the middle of the line
                m3r = paper.rect(rectX, rectY , rectLen, rectHeight, 5, 5).attr({
                    opacity: 1,
                    fill: 'white'
                });

                m3t.toFront();
            }
        };

    // Check if there is measureAids present
    currentAid = hasMeasures(wallId);
    // STEP 1 : creating the supporting lines.
    measuresStep1(currentAid);

    // Determening the angle of which the supporting lines will be transformed.
    if (this.inverted) {
        angle1 = 270;
        angle2 = 90;
    } else {
        angle1 = 90;
        angle2 = 270;
    }

    var transform = 'r'+angle1+','+startP1[1]+','+startP1[2],
        transformedPath = Raphael.transformPath(m1.attr('path'), transform);

    // Storing the starting point of supportline 3
    m31x = transformedPath[1][3];
    m31y = transformedPath[1][4];

    transform = 'r'+angle2+','+startP2[1]+','+startP2[2];
    transformedPath = Raphael.transformPath(m2.attr('path'), transform);

    // failsafe when corners are too close to each other (m2 being too short).
    if (typeof transformedPath[1] == 'undefined') {
        m1.remove();
        m2.remove();
        return wall.getTotalLength();
    }

    // Storing the ending point of supportline 3 and finally having it drawn together with its length
    m32x = transformedPath[1][3];
    m32y = transformedPath[1][4];

    // STEP 2: Calling the function that creates the paralell supportline and length text.
    measuresStep2(currentAid);

    // Transforming the supportlines 1 and 2 visually.
    m1.transform('r'+angle1+','+startP1[1]+','+startP1[2]);
    m2.transform('r'+angle2+','+startP2[1]+','+startP2[2]);

    // Adds to measurements set, but only if it was created (not moved).
    if (currentAid === false) {
        this.lengthAid.push([wallId, m1, m2, m3, m3r, m3t]);
    }

    return wall.getTotalLength();
};

/**
 * Function that finds the connecting walls.
 * @param {int} index - Index of the actual wall.
**/
Measurement.prototype.returnConnectingPaths = function(index) {

    var theRoom = TFplanner.ourRoom,
        walls = theRoom.walls,
        prevWall,
        thisWall;

        if (theRoom.finished) {
            prevWall = walls[index];
            thisWall = (walls[index+1] != null) ? walls[index+1] : walls[0];
        } else {
            prevWall = walls[index-1];
            thisWall = walls[index];
        }

    return [prevWall, thisWall];
};

/**
 * @class Holds the container for the scrollbox,
 * and some variables for easy access to styling of the buttons.
**/
function ScrollBox() {
    this.paper = Raphael(document.getElementById('navigation_container'));

    this.stroke = {
        'stroke': '#A59C94', 
        'stroke-width': 3, 
        'fill': 'white'
    };
    this.mainAttr = {
        'stroke-width': 0.5,
        'opacity': 0.6,
        'fill': '#CBC4BC'
    };
    this.innerAttr = {
        'stroke-opacity': 0,
        'opacity': 0.8,
        'fill': '#B6ADA5'
    };

    this.init();
}

/**
 * Initialization of the scrollBox in the right corner of the screen.
**/
ScrollBox.prototype.init = function() {

    // The strings for generating the arrow buttons
    var uparrow = 'M23.963,20.834L17.5,9.64c-0.825-1.429-2.175-1.429-3,0L8.037,20.834c'+
        '-0.825,1.429-0.15,2.598,1.5,2.598h12.926C24.113,23.432,24.788,22.263,23.963,20.834z',
    downarrow = 'M8.037,11.166L14.5,22.359c0.825,1.43,2.175,1.43,3,0l6.463-11.194c'+
        '0.826-1.429,0.15-2.598-1.5-2.598H9.537C7.886,8.568,7.211,9.737,8.037,11.166z',
    rightarrow = 'M11.166,23.963L22.359,17.5c1.43-0.824,1.43-2.175,0-3L11.166,8.037c'+
        '-1.429-0.826-2.598-0.15-2.598,1.5v12.926C8.568,24.113,9.737,24.789,11.166,23.963z',
    leftarrow = 'M20.834,8.037L9.641,14.5c-1.43,0.824-1.43,2.175,0,3l11.193,6.463c'+
        '1.429,0.826,2.598,0.15,2.598-1.5V9.537C23.432,7.887,22.263,7.211,20.834,8.037z', 
    plus = 'M25.979,12.896 19.312,12.896 19.312,6.229 12.647,6.229 12.647,12.896 5.979'+
        ' 12.896 5.979,19.562 12.647,19.562 12.647,26.229 19.312,26.229 19.312,19.562 25.979,19.562z',
    minus = 'M25.979,12.896,5.979,12.896,5.979,19.562,25.979,19.562z',

    mainFrame = this.paper.rect(0, 0, 100, 100, 0).attr(this.mainAttr),
    innerFrame = this.paper.rect(26, 26, 48, 48, 0).attr(this.innerAttr),

    // Creating and placing arrow buttons
    up = this.paper.path(uparrow).attr(this.stroke).translate(34, -3),
    down = this.paper.path(downarrow).attr(this.stroke).translate(34, 71),
    right = this.paper.path(rightarrow).attr(this.stroke).translate(71, 34),
    left = this.paper.path(leftarrow).attr(this.stroke).translate(-3, 34),
    zoom = this.paper.path(plus).attr(this.stroke).translate(34, 24),
    out = this.paper.path(minus).attr(this.stroke).translate(34, 46),

    /**
     * Function highlights button on mouseover
     * and add actions to the buttons.
     * @param button - Path-element created in the scrollbox.
     * @param key - The keycode for the corresponding arrowkey,
     * forcing the same action.
    **/
    funkify = function(button, key) {

        var theGrid = TFplanner.grid;

        button.hover( function() {

            button.attr({
                cursor: 'pointer',
                'stroke-opacity': 0.5,
                fill: 'white',
                'fill-opacity': 0.8
            });

        }, function() {

            button.attr({
                'stroke': '#A59C94',
                'stroke-opacity': 1,
                'fill-opacity': 1
            });
        }).mousedown( function(e) {

            e.preventDefault();

            if (key != 1 && key != -1) {
                theGrid.pan(key);

            } else {
                theGrid.handle(key);
            }
        });
    };

    // Adding tooltip to the zoom-buttons
    out.attr({title: 'Zoom ut'});
    zoom.attr({title: 'Zoom inn'});

    // Adding actions and effect to the buttons, a
    funkify(down, 40);
    funkify(up, 38);
    funkify(right, 39);
    funkify(left, 37);
    funkify(zoom, 1);
    funkify(out, -1);

    // The preventDefault bits prevents on-screen text from
    // being highlighted due to mouse (double)clicks
    mainFrame.mousedown(function(e) {
        e.preventDefault();
    });
    innerFrame.mousedown(function(e) {
        e.preventDefault();
    });
};

/**
 * @class Constructor for 10 cm X 10 cm subsquare
 * @param {int} x - X coordinate for upper left corner
 * @param {int} y - Y coordinate for upper left corner
 * @param {Paper} paper - Canvas for our drawing
 * @param {String} path - The room boundary expressed as a string
**/
function Subsquare (x, y, paper, path) {

    this.insideRoom = false;
    this.hasObstacle = false;
    this.hasWall = false;
    this.populated = false;
    this.rect = null;
    this.paper = paper;
    this.x = x;
    this.y = y;

    var subCheck = function(obj) {

        var xdim = 10,
            ydim = 10,
            ul = false,
            ur = false,
            ll = false,
            lr = false;

        //Checks whether all corners are inside of room
        //If path == null this check does not need to be done, it is quite
        // time consuming
        if (path != null) {
            ul = Raphael.isPointInsidePath(path, x, y);
            ur = Raphael.isPointInsidePath(path, x + xdim, y); 
            ll = Raphael.isPointInsidePath(path, x, y + ydim);
            lr = Raphael.isPointInsidePath(path, x + xdim, y + ydim);
        }

        //Subsquares are either in or out, if they are
        // "partially in" it means they contain a wall
        if (ul && ur && ll && lr) {
            obj.insideRoom = true;
        } else if (ul || ur || ll || lr) {
            obj.hasWall = true;
        }
    };
    subCheck(this);
}

/**
* Function sets color of the subsquare to the color
* of the mat.
* @param {Mat} mat - The heating mat in use
*/
Subsquare.prototype.setColor = function(mat) {

    this.rect = this.paper.rect(this.x, this.y, 10, 10).attr({
        'stroke-width': 0,
        'fill': mat.matColor
    });
};

/**
* Function stored the coordinates of the centre of the subsquare
* @param {Mat} mat - The heating mat in use
*/
Subsquare.prototype.setPath = function(mat) {

    mat.path.push([this.x+5, this.y+5]); 
};

/**
 * @class Constructor for a 0.5m X 0.5m square
 * @param {int} x - X coordinate of upper left corner
 * @param {int} y - Y coordinate of upper left corner
 * @param {String} path - The path string of the room
 * @param {Paper} paper - The canvas of the grid
 * @param {int} nr - The square number
**/
function Square (x, y, path, paper, nr) {
    this.xpos = x;
    this.ypos = y;
    this.insideRoom = false;
    this.hasObstacles = false;
    this.hasWall = false;
    this.populated = false;
    this.subsquares = [];
    this.area = 0;
    this.paper = paper;
    this.arrows = paper.set();
    this.reallyInside = true;
    this.nr = nr;
    this.direction = null;
    // Square is texted
    this.texted = false;
    
    var squareCheck = function(obj) {

        var xdim = 50, 
            ydim = 50,
            xsubdim = 10, 
            ysubdim = 10, 
            subsquare,
            ul = Raphael.isPointInsidePath(path, x, y),
            ur = Raphael.isPointInsidePath(path, x + xdim, y), 
            ll = Raphael.isPointInsidePath(path, x, y + ydim),
            lr = Raphael.isPointInsidePath(path, x + xdim, y + ydim),
            length = 0;

        obj.rect = paper.rect(x, y, xdim, ydim).attr({
            'stroke-width': 0.1
        });

        //If whole square is inside
        if (ul && ur && ll && lr) {

            obj.insideRoom = true;
            obj.hasWall = false;
            obj.area = (xdim * ydim);
        }
        //If at least one corner is inside   
        else if (ul || ur || ll || lr) {
            obj.insideRoom = true;
            obj.hasWall = true;

            for (var i = 0; i < ydim; i += ysubdim) {
                for (var j = 0; j < xdim; j += xsubdim) {

                    subsquare = new Subsquare((x + j), (y + i), paper, path);
                    obj.subsquares[length++] = subsquare;

                    if (subsquare.insideRoom) {
                        obj.area += (xsubdim * ysubdim);
                    }
                }
            }
        }
        //Whole square outside
        else {
            obj.reallyInside = false;
        }
    };

    squareCheck(this);
}

/*
* Function adds the mat color to the square, then creates and stores
* the coordinates of the centre of the square. THis is later
* used for drawing connecting red line through the mat.
* @param {Mat} mat - The mat currently in use
*/
Square.prototype.setPath = function(mat) {

    mat.path.push([this.xpos+25, this.ypos+25]);
    this.rect.attr({'fill': mat.matColor});
};

/**
 * Returns true if all the subsquares along a square edge contains a wall.
 * If this function returns true we can "shift" the wall to the next square (if unoccupied),
 * this allows us to maximize number of "wall-less" squares.
 * @param {int | array} arr - Array of subsquares to be checked (one square edge) 
**/
Square.prototype.movableWall = function(arr) {

    var sub = this.subsquares;

    if (sub[arr[0]].hasWall && sub[arr[1]].hasWall && sub[arr[2]].hasWall && sub[arr[3]].hasWall && sub[arr[4]].hasWall) {
        return true; 
    }
    return false;
};

/**
 * Removes wall elements along a square edge
 * @param {int | array} arr - Array containing subsquares to be removed (one square edge)
**/
Square.prototype.removeWall = function(arr) {

    var subsquare,
        area = 10*10,
        subNo;

    for (var i = 0; i < 5; ++i) {
        subNo = arr[i];
        if (this.subsquares[subNo].hasWall) {
            this.subsquares[subNo].hasWall = false;
            this.area += area;
        }
    }
    for (var i = 0; i < 25; ++i ) {
        subsquare = this.subsquares[i];
        if (subsquare.hasWall || subsquare.hasObstacle) 
            return;
    }

    //If function has not returned yet, there are no internal walls or obstacles left.
    //In this situation we clear the subsquares and revert to "empty" square
    this.hasWall = false;
    this.clearSubsquares();
};

/**
 * Function clears the subsquare array of the square
**/
Square.prototype.clearSubsquares = function() {

    this.hasWall = false;
    this.hasObstacles = false;

    for (var i = 24; i >= 0 ; --i){
        this.subsquares.pop();
    }
};

/**
 * Adds wall elements along a square edge
 * Function does not add usable area to the room, that is done by the removeWall-function
 * @param {path | array} arr - Array of wall elements to be added (one square edge)
**/
Square.prototype.addWall = function(arr) {

    var length = 0,
        xdim = 50,
        ydim = 50, 
        subdim = 10;

    //Populates with subsquares if there isn't a subgrid already
    if (!(this.hasWall || this.hasObstacles)) {
        for (var i = 0; i < ydim; i += subdim) {
            for (var j = 0; j < xdim; j += subdim) {
                this.subsquares[length++] = new Subsquare(this.xpos + j, this.ypos + i, this.paper);
            }
        }
    }   
    
    for (var i = 0; i < 5; ++i) { 
        this.subsquares[arr[i]].hasWall = true;
        this.subsquares[arr[i]].insideRoom = true;
    }
    this.hasWall = true;
};

/**
 * @class Creates the floor heating mats.
 * @param {int} matLength - The length of the mat
 * @param {int} timeoutLength - The time limit for this mat to be
 * placed. If limit is exceeded, next length will be tried
 * instead.
**/
function HeatingMat(matLength, timeoutLength) {
    this.totalArea = (matLength * 50);
    this.unusedArea = this.totalArea;
    this.timestamp = Date.now();
    this.validPeriod = timeoutLength ? timeoutLength : 500;
    this.matColor = null;
    this.productNr = null;
    this.textPlaced = false;
    this.path = [];
}

/**
 * Reduces the available area by the area of one square
**/
HeatingMat.prototype.addSquare = function() {
    this.unusedArea -= 50*50;
};

/**
 * Reduces the available area by the area of one subsquare
**/
HeatingMat.prototype.addSubsquare = function() {
    this.unusedArea -= 10*10;
};

/**
 * Increases the available area by the area of one square
**/
HeatingMat.prototype.removeSquare = function() {
    this.unusedArea += 50*50;
};

/**
 * Increases the availalbe area by the area of one subsquare
**/
HeatingMat.prototype.removeSubsquare = function() {
    this.unusedArea += 10*10;
};

/**
* Function draws the visualization line, as well as start and end
* points, onto the paper.
* @param {Paper} paper - The paper the line is drawn onto
*/
HeatingMat.prototype.draw = function(paper) {

    var len = this.path.length,
        pathString = '',
        x, y,
        rectLen,
        rectHeight,
        rectX,
        rectY, 
        start,
        end,
        textBox,
        text;

    for (var i = len-1; i >= 0; --i) {
        x = this.path[i][0];
        y = this.path[i][1];

        if (i == len-1) {

            if (x - this.path[i-1][0] < 0) {
                //Start arrow pointing right
                start = paper.path('M'+(x-5)+','+(y-5)+'L'+x+','+y+'L'+(x-5)+','+(y+5)+'Z');            
            } else if (x - this.path[i-1][0] > 0) {
                //Start arrow pointing left
                start = paper.path('M'+(x+5)+','+(y-5)+'L'+x+','+y+'L'+(x+5)+','+(y+5)+'Z');
            } else if (y - this.path[i-1][1] > 0) {
                //Arrow pointing up
                start = paper.path('M'+(x-5)+','+y+'L'+x+','+(y-5)+'L'+(x+5)+','+y+'Z');
            } else {
                //Arrow pointing downward
                start = paper.path('M'+(x-5)+','+y+'L'+x+','+(y+5)+'L'+(x+5)+','+y+'Z');
            }
            start.attr({
                'fill': '#CB2C30',
                'stroke': '#CB2C30'
            });
            pathString += ('M'+x+','+y);

        } else if (i == len-3) {

            text = paper.text(x, y, this.productNr).attr({
                    'font-size': TFplanner.measurement.fontsize
                });

            // Dynamic size of the rectangle surrounding the text.
            rectLen = (text.getBBox().width + 10);
            rectHeight = (text.getBBox().height);
            rectX = (x - (rectLen / 2));
            rectY = (y - (rectHeight / 2));

            textBox = paper.rect(rectX, rectY, rectLen, rectHeight, 5, 5).attr({
                opacity: 1,
                fill: 'white'
            });

            pathString += ('L'+x+','+y);

        } else if (i == 0) {

            end = paper.path('M'+(x-5)+','+y+'L'+x+','+(y-5)+'L'+(x+5)+','+y+'L'+x+','+(y+5)+'Z');
            end.attr({
                'fill': '#CB2C30',
                'stroke': '#CB2C30'
            });
            pathString += ('L'+x+','+y);
        } else {
            pathString += ('L'+x+','+y);
        }
    }
    //Draws the actual line
    paper.path(pathString).attr({
        'stroke': '#CB2C30',
        'stroke-width': 1
    });
    textBox.toFront();
    text.toFront();
};

/**
 * @class Creating the result display
 * @param {String} pathString - The room presented as ONE path.
**/ 
function ResultGrid(pathString) {
    this.height = TFplanner.grid.resHeight;
    this.width = TFplanner.grid.resWidth;
    this.paper = TFplanner.grid.paper;
    
    this.squares = [];
    this.startSquares = [];
    this.squarewidth = 0;
    this.squareheight= 0;
    this.area = 0;
    this.unusedArea = 0;
    //Validity period = 3 minutes/180000ms
    this.validPeriod = 180000;
    //Squarewidth and squareheight are the number
    // of squares high and wide the structure is
    this.path = pathString;
    this.chosenMats = [];
    // Color palette
    this.colorIndex = 0;
    this.matColors = [
        '#d3d3d3',
        '#a8a8a8', 
        '#7e7e7e',
        '#545454'
    ];
    this.currentColor = null;

    //Functionality to prepare data structure
    this.addSquares();
}

/**
 * Function that invokes the functionalites associated with the mat placements / guide.
**/
ResultGrid.prototype.calculateGuide = function () {

    var opts = TFplanner.options,
        that = this,

    /**
     * Function creates an array of the squares that are adjacent to a wall, which
     * gives a performance boost to findStart() 
    **/
    createStartPoints = function() {

        var square,
            width = that.squarewidth,
            len = that.squares.length - width, 
            supply = that.supplyPoint,
            squareList;

        for (var i = width; i < len; ++i) {
            square = that.squares[i];
            //If not inside the supply boundaries we can skip to next square
            if (supply && (square.xpos <= supply[0] || square.xpos >= supply[1] || 
                square.ypos < supply[2] || square.ypos >= supply[3])) {
                continue;
            }
            squareList = [i, i-width, i+1, i-1, i+width];
            if (that.adjacentWall(squareList, -1) && square.reallyInside) {
                that.startSquares.push(i);
            }
        }
    };

    this.supplyPoint = this.setSupplyPoint();
    this.addObstacles();
    this.moveWalls();
    createStartPoints();
    this.timestamp = Date.now();

    //Starts to populate the data structure
    if (this.findStart()) {
        opts.updateProgress(true, true);
    } else {
        opts.updateProgress(true, false);
    }
};

/**
 * Function creates a square/data structure
**/
ResultGrid.prototype.addSquares = function() {

    var xdim = 50, 
        ydim = 50,
        width = this.width,
        height = this.height,
        length = 0,
        square;

    // The grid is slightly larger than the figure, 
    // and grid is padded to avoid getting partial squares 
    height = height + 150 + (50 - height % 50);
    width = width + 150 + (50 - width % 50);
    this.squareheight = height/50;
    this.squarewidth = width/50;

    for (var i = 0; i < height; i += ydim) {
        for (var j = 0; j < width; j += xdim) {
            square = new Square(j, i, this.path, this.paper, length+1);
            this.squares[length++] = square;
        }
    }

    TFplanner.options.updateProgress(false);
};

/**
 * Clears the data structure and removes the drawn elements
**/
ResultGrid.prototype.clear = function() {

    var square;

    while (this.squares.length > 0) {
        square = this.squares.pop();

        if (square.subsquares.length != 0) {
            square.clearSubsquares();
        } 
    }
    //Removes the drawing
    this.paper.remove();
};

/**
 * Function finds the next valid starting square for a mat, then
 * calls placeMat to start the placement process
 * @return false if 'timedOut' or no start is found
**/
ResultGrid.prototype.findStart = function() {

    var width = this.squarewidth,
        supply = this.supplyPoint,
        index,
        square,
        squareList,
        xmin = null,
        xmax = null,
        ymin = null,
        ymax = null;

    // If no solution is found within alotted time, abort
    if ((Date.now() - this.timestamp) > this.validPeriod) {
        return false;
    }
 
    if (supply) {
        xmin = supply[0];
        xmax = supply[1];
        ymin = supply[2];
        ymax = supply[3];
    }
 
    for (var i = 0, ii = this.startSquares.length; i < ii; ++i) {
            index = this.startSquares[i];
            square = this.squares[index];
            squareList = [index, index-width, index+1, index-1, index+width];

        // If not inside the supply boundaries we can skip to next square
        if (supply && (square.xpos <= xmin || square.xpos >= xmax ||
                       square.ypos < ymin || square.ypos >= ymax)) {
            continue;
        }
       
        if (square.reallyInside && !square.populated) {
            if (square.subsquares.length === 0) {
                if (this.adjacentWall(squareList, -1) && 
                    this.placeMat(index, 1000, false, false)) {
                     return true; 
                } 
            } else {
                var strips =[ [0, 1, 2, 3, 4],      [5, 6, 7, 8, 9],      
                              [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], 
                              [20, 21, 22, 23, 24], [0, 5, 10, 15, 20],
                              [1, 6, 11, 16, 21],   [2, 7, 12, 17, 22],   
                              [3, 8, 13, 18, 23],   [4, 9, 14, 19, 24] ];

                // Checks for each subsquare if it has adjacent wall and recursive mat
                // placement
                for (var j = 0; j < 25; ++j) {
                    var sub = square.subsquares[j];

                    if (!sub.populated && !sub.hasWall && !sub.hasObstacle 
                        && this.adjacentWall(squareList, j)) {
                        var hor = Math.floor(j/5),
                            vert = j%5,
                            arr1 = strips[hor],
                            arr2 = strips[vert+5], 
                            arr3 = this.arrFree(index, arr1) ? arr1 : false,
                            arr4 = this.arrFree(index, arr2) ? arr2 : false;

                        if (this.placeMat(index, 1000, arr3, arr4)) {
                            return true;
                        }
                    }          
                }        
            }           
        }
    }
    return false;
    //End of findStart()
};

/**
 * Function tries to place mats by deciding mat length, then calling placeSquare.
 * Will try to place longest possible mat first, then in decreasing length.
 * @oaram {int} squareNo - The index of the square where mat is to be placed
 * @param {int} validPeriod - Valid timeperiod to use when placing mat
 * @param {int | array} arr1 - Array of horizontal strips, might be false.
 * @param {int | array} arr2 - Array of vertical strips, might be false.
 * @return False if mat-placement failed, true if success.
**/
ResultGrid.prototype.placeMat = function (squareNo, validPeriod, arr1, arr2) {

    var opts = TFplanner.options,
        mat,
        c,
        length,
        num,
        pref = [],
        prodNum = [],
        l = []; 

    //If no solution is found within alotted time, abort
    if ((Date.now() - this.timestamp) > this.validPeriod) {
        return false;
    }

    /** This functionality will be used if the user want to "override" what mat-lengths
     * to use. If the chosen mat doesn`t fit, it will not be used. This indicates
     * that the user must have some experience laying heating mats, and know what 
     * lengths that will fit in the room.
    **/
    if (opts.prefMat.length > 0) {

        for (var i = 0, ii = opts.prefMat.length; i < ii; i++) {
            pref[i] = opts.prefMat[i].length*100;
            // The object is undefined at this point, store the product-number.
            prodNum[i] = opts.prefMat[i].number;
        }

        if (pref.length > 0) {
            length = pref.shift();
            num = prodNum.shift();
            c = length * 50;

            if (c <= this.unusedArea) {
                mat = new HeatingMat(length, validPeriod);
                mat.productNr = num;
                // Take the mat out of the array, if it doesn`t fit in the room, we don`t
                // want to put it out anyway.
                opts.prefMat.shift();
                // PlaceSquare is where the placement of the mat begins
                if (!arr1 && !arr2 && this.placeSquare(squareNo, 0, mat, 0, -1)) {
                    mat.draw(this.paper);
                    this.chosenMats.push(mat.productNr);
                    return true;

                } else if ((arr1 && this.placeStrip(squareNo, arr1, mat, 0)) || 
                            (arr2 && this.placeStrip(squareNo, arr2, mat, 0))) {
                    mat.draw(this.paper);
                    this.chosenMats.push(mat.productNr);
                return true;
                }
                delete mat;
            }
        }
    } 
    // Get the length of all mats, and store it in cm instead of meters
    for (var i = 0, ii = opts.validMat.products.length; i < ii; i++) {
        l[i] = opts.validMat.products[i].length*100;
    }
    
    while (l.length > 0) {
        length = l.pop();
        c = length * 50;

        if (c <= this.unusedArea) {
            mat = new HeatingMat(length, validPeriod);
            mat.productNr = opts.validMat.products[l.length].number;

            // PlaceSquare is where the placement of the mat begins
            if (!arr1 && !arr2 && this.placeSquare(squareNo, 0, mat, 0, -1)) {
                mat.draw(this.paper);
                this.chosenMats.push(mat.productNr);
                return true;

            } else if ((arr1 && this.placeStrip(squareNo, arr1, mat, 0)) || 
                        (arr2 && this.placeStrip(squareNo, arr2, mat, 0))) {
                mat.draw(this.paper);
                this.chosenMats.push(mat.productNr);
                return true;
            }
            delete mat;
        }
    }
    //If we reach this point mat placement has failed, and we revert
    // and presumably recurse
    return false;
};

/**
 * Function that returns a color based on indexes 0-3.
 * The colors are defined in constructor.
**/
ResultGrid.prototype.pickColor = function() {

    if (this.colorIndex > 3) {
        this.colorIndex = 0;
    }

    return this.matColors[this.colorIndex];
};

/**
 * Recursivevely places squares until mat is full, then tries to
 * place new mat if area is not full
 * @param {int} squareNo - Index of square to be populated
 * @param {int} subsquareNo - Index of subsquare to be populated, 0-24 if there is one, -1 if not
 * @param {Mat} mat - The heating mat which is currently being placed
 * @param {int} lastSquareNo - Index of last square to be populated
 * @param {int} lastSubsquareNo - Index of last subsquare to be populated, -1 if last square did not
 *  use subsquares
 * @return False if square placement failed, true if success
**/
ResultGrid.prototype.placeSquare = function (squareNo, subsquareNo, mat, lastSquareNo, lastSubsquareNo) {

    var square = this.squares[squareNo],
        width = this.squarewidth,
        area = 50*50,
        timeout = Date.now(),
        obst = TFplanner.obstacles,
        u = squareNo-width,
        l = squareNo-1,
        r = squareNo+1,
        d = squareNo+width,
        up = this.squares[u], 
        left =  this.squares[l], 
        right = this.squares[r], 
        down = this.squares[d],
        squareList,
        supply,
        correctWall,
        direction,
        arr = [],
        dir = squareNo - lastSquareNo;

    // If the recursive placement is taking too long, abort mat.
    if ((timeout - mat.timestamp) > mat.validPeriod ||
         (timeout - this.timestamp) > this.validPeriod) {
        return false;
    }


    // If there are now walls or other obstacles is square (no subsquare structure)
    // or if there is not enough area left in mat to fill an empty square
    if (!square.populated && (square.subsquares.length == 0) && (mat.unusedArea >= area)) {

        // Toggles this square as populated
        this.squares[squareNo].populated = true;
        mat.addSquare();
        this.unusedArea -= area;

        // If whole mat has been successfully placed: return true if new mat can be placed or room
        // is full, if not revert and recurse
        if (mat.unusedArea == 0) {
            squareList = [squareNo, squareNo-width, squareNo +1, squareNo-1, squareNo+width];
            supply = this.supplyPoint;
            correctWall = true;

            // Mats cannot end on same wall that contains the supplypoint
            if (obst.supplyEnd && supply && 
                (square.xpos >= supply[0] && square.xpos <= supply[1] && 
                square.ypos >= supply[2] && square.ypos <= supply[3])) {

                correctWall = false;
            }

            if (correctWall && this.adjacentWall(squareList, -1) && 
                 (this.unusedArea == 0 || this.findStart())) {
                
                // Picks color, then increments.
                this.currentColor = this.pickColor();
                this.colorIndex++;
                mat.matColor = this.currentColor;

                if (dir > 1) {
                    direction = 0;
                } else if (dir == 1) {
                    direction = 1;
                } else if (dir == -1) {
                    direction = 2;
                } else {
                    direction = 3;
                }
                this.squares[squareNo].setPath(mat);

                return true;
            } else {
                //Revert and recurse
                this.unusedArea += area;
                square.arrows.remove();
                this.squares[squareNo].populated = false;
                mat.removeSquare();
                return false;
            }
        }

        if (right.reallyInside && !right.populated && 
              this.proceed(r, 'right', squareNo, mat)) {
            return true;
        } else if (left.reallyInside && !left.populated && 
                  this.proceed(l, 'left', squareNo, mat)) {
            return true;
        } else if (up.reallyInside&& !up.populated && 
                  this.proceed(u, 'up', squareNo, mat)) {
            return true;
        } else if (down.reallyInside && !down.populated && 
                  this.proceed(d, 'down', squareNo, mat)) {
            return true;
        }

        // If function comes to this point, attempt has failed.
        // Reset and revert to previous square
        this.unusedArea += area;
        this.squares[squareNo].populated = false;
        mat.removeSquare();
    } 
    else {
        // If the end needs to be divided into subsquares to reach a wall we will 
        // need to know which direction we came from
        if (mat.unusedArea < area && lastSubsquareNo == -1) {

            //From left or top
            if (dir > 1) {
                arr = [0, 1, 2, 3, 4];
                subsquareNo = 20;
            } else if (dir == -1) {
                arr = [4, 9, 14, 19, 24];
                subsquareNo = 4; 
            } else if (dir == 1) {
                subsquareNo = 0;
                arr = [0, 5, 10, 15, 20];
            }
            else {
                arr = [20, 21, 22, 23, 24];
                subsquareNo = 0;
            }
        }
        if (this.placeSubsquare(squareNo, subsquareNo, mat, lastSubsquareNo)) {
            return true;
        }   
    }
    return false;
};

/**
 * Function places a strip of 5 adjacent subsquares, intended to extend a series
 * of squares all the way to a wall.
 * @param {int} squareNo - Index of the square to place the strip in
 * @param {int | array} arr - Array of indexes of the 5 subsquares to be placed
 * @param {Mat} mat - The heating mat currently being placed
 * @param {int} lastSquareNo - Index of the last square placed
 * @return false if placement failed, true if success
**/
ResultGrid.prototype.placeStrip = function(squareNo, arr, mat, lastSquareNo) {

    var square = this.squares[squareNo],
        subsquares = square.subsquares,
        timeout = Date.now(),
        area = 10*10,
        added = false,
        squareFull = true,
        abort = false,
        width = this.squarewidth,
        supply = this.supplyPoint,
        u = squareNo - width,
        d = squareNo + width,
        l = squareNo - 1,
        r = squareNo + 1,
        up = this.squares[u],
        right = this.squares[r],
        left = this.squares[l],
        down = this.squares[d],
        x, y, s,
        squareList,
        correctWall,
        rstrip = [],
        lstrip = [],
        ustrip = [], 
        dstrip = [];

    // If the recursive placement is taking too long, abort mat
    if ((timeout - mat.timestamp) > mat.validPeriod ||
         (timeout - this.timestamp) > this.validPeriod) {
        abort = true;
    }

    // If no subsquare structure exists, create one. 
    // Will happen if function is called because mat unused area is less
    // than a full square.
    if (subsquares.length == 0) {
        for (var i = 0; i < 25; ++i) {
            x = square.xpos + (i%5)*10;
            y = square.ypos + Math.floor(i/5)*10;
            s = new Subsquare(x, y, this.paper);

            s.insideRoom = true;
            this.squares[squareNo].subsquares.push(s);
        }
        added = true;
    }

    if (!this.arrFree(squareNo, arr)) {
        if (added === true) {
            this.squares[squareNo].clearSubsquares();
        }
        return false;
    }
    
    for (var i = 0; i < 5; ++i) {
        this.squares[squareNo].subsquares[arr[i]].populated = true;
        this.unusedArea -= area; 
        mat.addSubsquare();
    }

    // If end of mat is reached: check if new mat can be placed or if room is full,
    // if not revert and recurse.
    if (mat.unusedArea == 0) {
        squareList = [squareNo, u, r, l, d];
        correctWall = true;

        // Mats cannot end on same wall that contains the supplypoint
        if (TFplanner.obstacles.supplyEnd && supply && 
             (square.xpos >= supply[0] && square.xpos <= supply[1] && 
               square.ypos >= supply[2] && square.ypos <= supply[3])) {
            correctWall = false;
        }

        // One subsquare must be adjacent to a valid wall segment
        if (correctWall &&
            (this.adjacentWall(squareList, arr[0]) || 
             this.adjacentWall(squareList, arr[1]) ||
             this.adjacentWall(squareList, arr[2]) ||
             this.adjacentWall(squareList, arr[3]) ||
             this.adjacentWall(squareList, arr[4]))
            && (this.unusedArea == 0 || this.findStart())) {

            // Picks color, then increments.
            this.currentColor = this.pickColor();
            this.colorIndex++;
            mat.matColor = this.currentColor;

            this.colorArr(squareNo, arr, mat);
            return true;

        } else  {
            for (var i = 0; i < 5; ++i ) {
                this.unusedArea += area;
                mat.removeSubsquare();
            }
            if (added === true) {
                this.squares[squareNo].clearSubsquares();
            }
            this.squares[squareNo].populated = false;
            return false;
        }
    }

    // A quick check to see if square is now fully populated
    for (var i = 0; i < 25; ++i) {
        s = subsquares[i];

        if (!(s.populated || s.hasWall || s.hasObstacle)) {
            squareFull = false;
        }
    }
    this.squares[squareNo].populated = squareFull;

    // Finds adjacent strips
    if (arr[0] <= 4 && arr[4] >=20) {
        // Vertical strip - right/left placement
        rstrip = (arr[0] < 4) ? [arr[0]+1, arr[1]+1, arr[2]+1, arr[3]+1, arr[4]+1] : null;
        lstrip = (arr[0] > 0) ? [arr[0]-1, arr[1]-1, arr[2]-1, arr[3]-1, arr[4]-1] : null;
        ustrip = null;
        dstrip = null;
    } else {
        // Horizontal strip - up/down placement
        ustrip = (arr[0] > 4) ? [arr[0]-5, arr[1]-5, arr[2]-5, arr[3]-5, arr[4]-5] : null;
        dstrip = (arr[0] < 20) ? [arr[0]+5, arr[1]+5, arr[2]+5, arr[3]+5, arr[4]+5] : null;
        rstrip = null;
        lstrip = null;
    }

    // First tries to populate within the square by order right-left-up-down, 
    // then tries the next squares in order right-left-up-down
    if (!abort && rstrip && this.placeStrip(squareNo, rstrip, mat, lastSquareNo)) {
        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (!abort && lstrip && this.placeStrip(squareNo, lstrip, mat, lastSquareNo)) {
        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (!abort && ustrip && this.placeStrip(squareNo, ustrip, mat, lastSquareNo)) {
        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (!abort && dstrip && this.placeStrip(squareNo, dstrip, mat, lastSquareNo)) {
        this.colorArr(squareNo, arr, mat);
        return true;

    } else if ((arr[4] % 5 == 4) && !right.populated && right.reallyInside && 
                right.subsquares.length == 0 && !abort && (mat.unusedArea >= right.area) &&
                this.placeSquare(r, 0, mat, squareNo, -1)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    }  else if ((arr[0] % 5 == 0) && (arr[4] % 5 == 4) && !right.populated && 
                 right.reallyInside && !abort && 
                 this.placeStrip(r, arr, mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if ((arr[0] == 4) && (arr[4]  == 24) && !right.populated && 
                right.reallyInside && !abort &&  
                this.placeStrip(r, [0, 5, 10, 15, 20], mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if ((arr[0] % 5 == 0) && !left.populated && left.reallyInside &&
                left.subsquares.length == 0 && !abort && (mat.unusedArea >= left.area) &&
                this.placeSquare(l, 4, mat, squareNo, -1)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (arr[0] % 5 ==  0 && arr[4] % 5 == 4  && !left.populated && 
                left.reallyInside && !abort && 
                this.placeStrip(l, arr, mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (arr[0] == 0 && arr[4] == 20 && !left.populated && 
                left.reallyInside && !abort &&
                this.placeStrip(l, [4, 9, 14, 19, 24], mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (arr[0] >= 0 && arr[0] < 5 && !up.populated && up.reallyInside && 
                up.subsquares.length == 0 && !abort && (mat.unusedArea >= up.area) &&
                this.placeSquare(u, 20, mat, squareNo, -1)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (arr[0] >= 0 && arr[0] < 5 && arr[4] >= 20 && !up.populated && 
                up.reallyInside && !abort && 
                this.placeStrip(u, arr, mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (arr[0] == 0 && arr[4] == 4 && !up.populated && 
                up.reallyInside && !abort && 
                this.placeStrip(u, [20, 21, 22, 23, 24], mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if ((arr[4] >= 20 && arr[4] < 25 ) && !down.populated && down.reallyInside && 
                down.subsquares.length == 0 && !abort && (mat.unusedArea >= down.area) &&
                this.placeSquare(d, 0, mat, squareNo, -1)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (arr[0] >= 0 && arr[0] < 5 && arr[4] >= 20 && !down.populated && 
                down.reallyInside && !abort && 
                this.placeStrip(d, arr, mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;

    } else if (arr[0] == 20 && arr[4] == 24 && !down.populated && 
                down.reallyInside && !abort && 
                this.placeStrip(d, [0, 1, 2, 3, 4], mat, squareNo)) {

        this.colorArr(squareNo, arr, mat);
        return true;
    } 

    //Exit plan
    for (var i = 0; i < 5; ++i) {
        this.squares[squareNo].subsquares[arr[i]].populated = false;
        this.unusedArea += area; 
        mat.removeSubsquare();
    }
    if (added === true) {
        this.squares[squareNo].clearSubsquares();
    }
    this.squares[squareNo].populated = false;
    return false;  
};

/**
 * Function populated a subsquare, if possible, then recursively calls itself. When no
 * new subsquare can be reached it will try to call placeSquare for the next square instead.
 * This function has been rendered obsolete by placeStrip(), but is still the fallback procedure
 * for placeSquare().
 * @param {int} squareNo - Index of square containing the subsquare to be populated
 * @param {int} subSquareNo - Index of subsquare to be populated
 * @param {Mat} mat - The heating mat which is currently placed
 * @param {int} lastSubsquareNo - The last subsquare populated. Will be -1 if this function is called
 *  from a square without subsquares
 * @return False is subsquare placement failed, true if success
**/
ResultGrid.prototype.placeSubsquare = function(squareNo, subsquareNo, mat, lastSubsquareNo) {

    var square = this.squares[squareNo],
        subsquares = square.subsquares,
        added = false,
        abort = false,
        timeout = Date.now(),
        x, y, s,
        squareList,
        sub,
        width = this.squarewidth,
        area = 10*10,
        squareFull = true,
        u = subsquareNo-5,
        l = subsquareNo-1,
        r = subsquareNo+1,
        d = subsquareNo+5,
        up = null, 
        left = null, 
        right = null, 
        down = null;


    // If the recursive placement is taking too long, abort mat
    // Simply returning false will not work due to asynchronous nature
    if ((timeout - mat.timestamp) > mat.validPeriod) {
        abort = true;
    }

    // If no subsquare structure exists, create one. 
    // Will happen if function is called because mat unused area is less
    // than a full square
    if (subsquares.length == 0) {
        for (var i = 0; i < 25; ++i) {
            x = square.xpos + (i % 5)*10;
            y = square.ypos + Math.floor(i / 5)*10;
            s = new Subsquare(x, y, this.paper);

            s.insideRoom = true;
            this.squares[squareNo].subsquares.push(s);
        }
        added = true;
    }

    sub = subsquares[subsquareNo];
    // The subsquare must be free to populate
    if (!(sub.hasWall || sub.hasObstacle || sub.populated)) {
        this.squares[squareNo].subsquares[subsquareNo].populated = true;
        this.unusedArea -= area;
        mat.addSubsquare();

        //If end of mat is reached: check if new mat can be placed or if room is full,
        // if not revert and recurse
        if (mat.unusedArea == 0) {
            squareList = [squareNo, squareNo-width, squareNo +1, squareNo-1, squareNo+width];
            
            if (this.adjacentWall(squareList, subsquareNo) && 
                (this.unusedArea == 0 || this.findStart())) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            } else  {
                this.unusedArea += area;
                mat.removeSubsquare();
                this.squares[squareNo].populated = false;
    
                if (added === true) {
                    this.squares[squareNo].clearSubsquares();
                }
                return false;
            }
        }

        // A quick check to see if square is now fully populated
        for (var i = 0; i < 25; ++i) {
            s = subsquares[i];
            if (!(s.populated || s.hasWall || s.hasObstacle)) {
                squareFull = false;
            }
        }
        this.squares[squareNo].populated = squareFull;

        // We first try to populate within the same square, then move to the adjacent squares
        // Up, inside same square
        if (u >= 0 && abort === false) {
            up = subsquares[u];
            if (!up.hasWall && !up.hasObstacle && !up.populated 
                && this.placeSubsquare(squareNo, u, mat, lastSubsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }
        // Right within same square
        if ((r < 25) && (r%5 != 0) && abort === false) {
            right = subsquares[r];
            if (!right.hasWall && !right.hasObstacle && !right.populated 
                && this.placeSubsquare(squareNo, r, mat, lastSubsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }
        //Left within same square
        if ((l >= 0) && (l%5 != 4) && abort === false) {
            left = subsquares[l];
            if (!left.hasWall && !left.hasObstacle && !left.populated 
                && this.placeSubsquare(squareNo, l, mat, lastSubsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }
        //Down inside same square
        if ((d < 25) && abort === false) {
            down = subsquares[d];
            if (!down.hasWall && !down.hasObstacle && !down.populated 
                && this.placeSubsquare(squareNo, d, mat, lastSubsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }

        //Up into the adjacent square
        if (u < 0 && abort == false) {
            up = this.squares[squareNo-width];
            if (up.reallyInside && !up.populated && 
                this.placeSquare(squareNo-width, u+25, mat, squareNo, subsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }

        //Right to next square
        if (r%5 == 0 && abort === false) {
            right = this.squares[squareNo+1];
            if (right.reallyInside && !right.populated && 
                this.placeSquare(squareNo+1, r-5, mat, squareNo, subsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }

        //Left to previous square
        if ((l == -1 || l%5 == 4) && abort === false) {
            left = this.squares[squareNo-1];
            if (left.reallyInside && !left.populated && 
                this.placeSquare(squareNo-1, l+5, mat, squareNo, subsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }

        //Down to square below
        if (d > 24 && abort === false) {
            down = this.squares[squareNo + width];
            if (down.reallyInside && !down.populated && 
                this.placeSquare(squareNo+width, d-25, mat, squareNo, subsquareNo)) {

                sub.setColor(mat);
                sub.setPath(mat);
                return true;
            }
        }

        //Could not place subsquare, reset and recurse
        this.unusedArea += area;
        mat.removeSubsquare();
        this.squares[squareNo].populated = false;
        this.squares[squareNo].subsquares[subsquareNo].populated = false;
    }

    //If a subsquare structure was constructed, remove it
    if (added === true) {
        this.squares[squareNo].clearSubsquares();
    }
    return false;
    //End of placeSubsquare
};

/**
 * Function moves all walls that are erroneously marked as being inside a square
 * to the adjacent square instead
**/
ResultGrid.prototype.moveWalls = function() {

    var leftWall = [0, 5, 10, 15, 20],
        rightWall = [4, 9, 14, 19, 24],
        upWall = [0, 1, 2, 3, 4],
        downWall = [20, 21, 22, 23, 24],
        squares = this.squares,
        width = this.squarewidth,
        len = squares.length-width, 
        square,
        up, down, left, right,
        u, d, l, r,
        area,
        clearable, 
        walls,
        sub,
        really;

    for (var i = width; i <= len; ++i) {
        square = this.squares[i];

        if (square.hasWall) {
            up = false;
            down = false;
            left = false; 
            right = false;
            //Finds neighboring squares
            u = this.squares[i-width];
            d = this.squares[i+width];
            l = this.squares[i-1];
            r = this.squares[i+1];

            //Checks for each direction whether the wall is movable.
            //Wall is movable if all 5 subsquares along one edge contain
            // wall
            if (square.movableWall(upWall) && 
                (!u.insideRoom || (l.insideRoom && !l.hasWall && 
                                    r.insideRoom && !r.hasWall))) {
                up = true;   
            } 
            if (square.movableWall(leftWall) && 
                (!l.insideRoom || (u.insideRoom && !u.hasWall && 
                                    d.insideRoom && !d.hasWall))) {
                left = true;  
            }
            if (square.movableWall(rightWall) && 
                (!r.insideRoom || (u.insideRoom && !u.hasWall && 
                                    d.insideRoom && !d.hasWall))) {
                right = true;
            }
            if (square.movableWall(downWall) && 
                (!d.insideRoom || (l.insideRoom && !l.hasWall && 
                                    r.insideRoom && !r.hasWall))) {
                down = true;   
            }
                
            //Shifts the movable walls to the adjacent square
            if (up) {
                this.squares[i].removeWall(upWall);
                this.squares[i-width].addWall(downWall);
            }
            if (right) {
                this.squares[i].removeWall(rightWall);
                this.squares[i+1].addWall(leftWall);
            }
            if (left) {
                this.squares[i].removeWall(leftWall);
                this.squares[i-1].addWall(rightWall);
            }
            if (down) {
                this.squares[i].removeWall(downWall);
                this.squares[i+width].addWall(upWall);
            }
        }
    }

    //Cannot set insideRoom in loop above, if we did only one wall adjacent
    // to a free space could be shifted
    for (var i = 0, ii = this.squares.length; i < ii; ++i) {
        square = this.squares[i];

        if (square.hasWall) {
            this.squares[i].insideRoom = true;
        }

        //Cleans up any leftover corners that are no longer connected to walls
        if (square.hasWall && i > width && i < len) {
            clearable = true;
            walls = false;
            sub = square.subsquares;
            u = this.squares[i-width];
            d = this.squares[i+width];
            l = this.squares[i-1];
            r = this.squares[i+1];
            area = 10*10;

            if (!u.hasWall && !l.hasWall && sub[0].hasWall
                 && !(sub[1].hasWall || sub[5].hasWall)) {
                this.squares[i].subsquares[0].hasWall = false;
                this.squares[i].area += area;
            }
            if (!u.hasWall && !r.hasWall && sub[4].hasWall 
                && !(sub[3].hasWall || sub[9].hasWall)) {
                this.squares[i].subsquares[4].hasWall = false;
                this.squares[i].area += area;
            }
            if (!d.hasWall && !l.hasWall && sub[20].hasWall
                 && !(sub[15].hasWall || sub[21].hasWall)) {
                this.squares[i].subsquares[20].hasWall = false;
                this.squares[i].area += area;
            }
            if (!r.hasWall && !d.hasWall && sub[24].hasWall
                 && !(sub[23].hasWall || sub[19].hasWall)) {
                this.squares[i].subsquares[24].hasWall = false;
                this.squares[i].area += area;
            }

            //If square no longer contains obstacles or walls:
            // Remove subsquare structure
            for (var j = 0; j < 25; ++j) {
                if (square.subsquares[j].hasWall) {
                    clearable = false;
                    walls = true;
                }
                else if (square.subsquares[j].hasObstacle) {
                    clearable = false;
                }
            }
            if (clearable) {
                this.squares[i].clearSubsquares();
            }
        }
        //Shifting walls frees up usable space
        this.area += square.area;

        //Checks if square is inside room or merely has walls
        if (square.hasWall) {
            really = false;
            for (var j = 0; j < 25; ++j) {
                if (square.subsquares[j].insideRoom && !square.subsquares[j].hasWall) {
                    really = true;
                    break;
                }
            }
            this.squares[i].reallyInside = really;
        }
    }

    TFplanner.options.availableArea = (this.area / 10000);
    this.area -= 3000;
    this.area -= this.area%10000;
    this.unusedArea = this.area;
    //End of moveWalls
};

/**
 * Function checks whether there is piece of wall which 
 * is adjacent in the given direction.
 * @param {int | array} squareList - List of square indexes involved [self, up, right, left, down]
 * @param {int} subsquareNo - The subsquare to be evaluated, -1 if 
 *  no subsquare-structure in square
 * @return True if square or subsquare is adjacent to a wall, false if not
**/
ResultGrid.prototype.adjacentWall = function (squareList, subsquareNo) {

    var square = this.squares[squareList[0]],
        targetSubsquares,
        wall,
        targetSquare,
        target,
        arr,
        subsquare,
        up, 
        down, 
        left, 
        right,
        upSquare,
        rightSquare,
        leftSquare,
        downSquare;

    //If the square calling the function does not have subsquare structure
    if (subsquareNo == -1) {

        for (var direction = 1; direction < 5; direction++) {
            //Checks for walls in adjacent square above-right-left-down
            if (direction == 1) {
                wall = [20, 21, 22, 23, 24]; 
            }
            else if (direction == 2) {
                wall = [0, 5, 10, 15, 20];
            }
            else if (direction == 3) {
                wall = [4, 9, 14, 19, 24];
            }
            else if (direction == 4) {
                wall = [0, 1, 2, 3, 4];
            }
            targetSquare = this.squares[squareList[direction]];

            if (targetSquare.hasWall) {

                targetSubsquares = targetSquare.subsquares;

                for (var i = 0; i < 5; ++i) {
                    target = wall[i];
                    if (targetSubsquares[target].hasWall)
                        return true;
                }
            }
        }
    }
    //Else executes if subsquare structure already exists,
    // i.e. if the square contains obstacles or walls
    else {     
        arr = square.subsquares;
        upSquare = this.squares[squareList[1]];
        rightSquare = this.squares[squareList[2]];
        leftSquare = this.squares[squareList[3]];
        downSquare = this.squares[squareList[4]];
        subsquare = arr[subsquareNo];

        //The subsquare we're checking FROM must be free
        // (but can be populated)
        if (subsquare.insideRoom && !subsquare.hasWall && !subsquare.hasObstacle) {

            //Finds neighboring subsquares inside own square 
            up = (subsquareNo > 4) ? arr[subsquareNo-5] : null;
            down = (subsquareNo < 20) ? arr[subsquareNo+5] : null;
            left = ((subsquareNo % 5) != 0) ? arr[subsquareNo-1] : null;
            right = ((subsquareNo % 5) != 4) ? arr[subsquareNo+1] : null;

            //If any neighboring squares have walls
            if ((up && up.hasWall) || (down && down.hasWall) ||
                 (right && right.hasWall) || (left && left.hasWall)) {
                return true;
            } 
            //or if subsquare directly to the top has wall
            else if (!up && upSquare.hasWall && 
                        upSquare.subsquares[subsquareNo+20].hasWall) {
                return true;
            }
            //or if subsquare directly to the right has wall
            else if (!right && rightSquare.hasWall && 
                        rightSquare.subsquares[subsquareNo-4].hasWall) {
                return true;
            }
            //or if subsquare directly to the left has wall
            else if (!left && leftSquare.hasWall && 
                        leftSquare.subsquares[subsquareNo+4].hasWall) {
                return true;
            }   
            //or if subsquare directly down has wall
            else if (!down && downSquare.hasWall && 
                        downSquare.subsquares[subsquareNo-20].hasWall) {
                return true;
            }
        }
    }
    return false;
};

/**
 * Function adds obstacles to the datastructure. 
 * DOES NOT check whether obstacles are inside room, this responsibility
 * is left to the user!
**/
ResultGrid.prototype.addObstacles = function() {

    var list = TFplanner.obstacles.obstacleSet,
        width = this.squarewidth,
        obstacle,
        startSquare,
        currentSquare,
        x, y, 
        xdim,
        ydim,
        xoffset,
        yoffset,
        area,
        sub,
        square,
        xtemp,
        ytemp,
        s;

    for (var i = 0, ii = list.length; i < ii; ++i) {
        obstacle = list[i];
        x = obstacle.attr('x');
        y = obstacle.attr('y');
        xdim = obstacle.attr('width')/10;
        ydim = obstacle.attr('height')/10;
        startSquare = Math.floor(x/50) + (Math.floor(y/50) * width);
        currentSquare = startSquare;
        xoffset = x % 50;
        yoffset = y % 50;
        area = 10*10;

        // Traverses obstacle as a two-dimensional array of subsquares
        // and toggles hasObstacle in each subsquare
        for (var j = 0; j < ydim; ++j) {
            for (var k = 0; k < xdim; ++k) {
                square = this.squares[currentSquare];

                // Creates subsquare structure if there is none
                // (Squares with walls will already have a subsquare structure)
                if (square.subsquares.length == 0) {
                    for (var n = 0; n < 25; ++n) {
                        xtemp = square.xpos + (n % 5)*10;
                        ytemp = square.ypos + Math.floor(n / 5)*10;
                        s = new Subsquare(xtemp, ytemp, this.paper, null);

                        s.insideRoom = true;
                        this.squares[currentSquare].subsquares.push(s);
                    }
                }
                //Finds subsquare number
                sub = yoffset/2+xoffset/10;
                //Marks subsquare as unavailable and decrements area available
                this.squares[currentSquare].subsquares[sub].hasObstacle = true;
                this.squares[currentSquare].area -= area;
                this.squares[currentSquare].hasObstacles = true;

                //Moves to next subsquare on x-axis
                xoffset = (xoffset + 10) % 50;
                //Changes to next square when necessary
                if (xoffset == 0) {
                    currentSquare += 1;
                }
            }

            xoffset = x % 50;
            // X-axis loop finished, return to start and repeat one line below
            currentSquare = startSquare;
            yoffset = (yoffset + 10) % 50;
            // Changes to next row of squares
            if (yoffset == 0) {
                currentSquare += width;
                startSquare = currentSquare;
            }
        }
    }
};

/**
 * Sets supply point if one has been set by user. The supply point defines
 * a wall, and all starting points must be adjacent to this wall.
 * @return Bounding box of wall containing supply point
**/
ResultGrid.prototype.setSupplyPoint = function () {

    var obst = TFplanner.obstacles,
        list = obst.obstacleSet,
        walls = TFplanner.ourRoom.walls,
        supply = obst.supplyPoint,
        wall,
        xmin,
        xmax,
        ymin,
        ymax,
        x1, x2, y1, y2,
        x, y;

    for (var i = 0, ii = obst.obstacleSet.length; i < ii; ++i) {
        if (list[i].id == supply) {
            x = list[i].attr('x');
            y = list[i].attr('y');

            // Remvoves supplyPoint so that it doesn't act as obstacle (take up space etc.)
            obst.obstacleSet[i].remove();
            obst.txtSet[i].remove();

            // Why 11? Because of the x/y offset when moving the room and because
            // the supply point itself has dimensions 10*10
            // And, as importantly, these go to 11
            for (var j = 0, jj = walls.length; j < jj; ++j) {
                wall = walls[j];
                x1 = wall.attrs.path[0][1];
                x2 = wall.attrs.path[1][1];
                y1 = wall.attrs.path[0][2];
                y2 = wall.attrs.path[1][2];
                xmin = (x1 < x2) ? (x1 - 11) : (x2 - 11);
                xmax = (x1 < x2) ? (x2 + 11) : (x1 + 11);
                ymin = (y1 < y2) ? (y1 - 11) : (y2 - 11);
                ymax = (y1 < y2) ? (y2 + 11) : (y1 + 11);

                //+/-40 to allow for whole square inside boundaries
                if (x < xmax && x > xmin && y < ymax && y > ymin) {
                    return ([xmin-40, xmax+40, ymin-40, ymax+40]);
                }
            } 
        }
    }
};

/**
* Checks that all subsquares in an array are free to populate.
* @param {int} squareNo - Index of square in which subsquares are found
* @param {int | array} arr - Array of subsquare indexes to be checked
* @return true if subsquare free to populate, false if not
**/
ResultGrid.prototype.arrFree = function(squareNo, arr) {

    var sub;

    for (var i = 0, ii = arr.length; i < ii; ++i) {
        sub = this.squares[squareNo].subsquares[arr[i]];
        if (!sub || sub.hasObstacle || sub.populated || sub.hasWall)  {
            return false;
        }
    }
    return true;
};

/**
* Function handles the transition from one full square to the next square.
* If the square is empty it populates with a 50cm*50cm segment, if not it 
* will try to populate with  
* @param {int} squareNo - The index of the square we're transitioning to
* @param {String} direction - The direction from which this square is being entered
* @param {int} lastSquareNo - The index of the previous square
* @param {Mat} mat - The heating mat currently being placed
* @return True if stepping to next square succeeded, false if not
**/
ResultGrid.prototype.proceed = function(squareNo, direction, lastSquareNo, mat) {
    
    var strip0 = [], 
        strip1 = [],
        strip2 = [],
        strip3 = [],
        strip4 = [],
        strip5 = [],
        arr = [],
        square = this.squares[squareNo],
        subsquare,
        arrow;

    //Switch sets priority for strip placement varying in accordance with
    //which direction this square is entered as well as the direction the previous
    //square was entered. Also sets the entry point for the square to be populated
    //and the direction of connecting line/heating mat symbolization
    switch (direction) {
        case 'up':
            strip0 =  [20, 21, 22, 23, 24];
            strip1 = [0, 5, 10, 15, 20];
            strip2 = [1, 6, 11, 16, 21];
            strip3 = [2, 7, 12, 17, 22];
            strip4 = [3, 8, 13, 18, 23];
            strip5 = [4, 9, 14, 19, 24];

            arr = [strip0, strip5, strip4, strip3, strip2, strip1];
            subsquare = 20;
            arrow = 0;
            break;

        case 'right':
            strip0 =  [0, 5, 10, 15, 20];
            strip1 = [0, 1, 2, 3, 4];
            strip2 = [5, 6, 7, 8, 9];
            strip3 = [10, 11, 12, 13, 14];
            strip4 = [15, 16, 17, 18, 19];
            strip5 = [20, 21, 22, 23, 24];

            arr = [strip1, strip2, strip3, strip4, strip5, strip0];
            subsquare = 0;
            arrow = 1;
            break;

        case 'left':
            strip0 =  [4, 9, 14, 19, 24];
            strip1 = [0, 1, 2, 3, 4];
            strip2 = [5, 6, 7, 8, 9];
            strip3 = [10, 11, 12, 13, 14];
            strip4 = [15, 16, 17, 18, 19];
            strip5 = [20, 21, 22, 23, 24];

            arr = [strip1, strip2, strip3, strip4, strip5, strip0];
            subsquare = 4;
            arrow = 2;
            break;

        case 'down':
            strip0 = [0, 1, 2, 3, 4];
            strip1 = [0, 5, 10, 15, 20];
            strip2 = [1, 6, 11, 16, 21];
            strip3 = [2, 7, 12, 17, 22];
            strip4 = [3, 8, 13, 18, 23];
            strip5 = [4, 9, 14, 19, 24];

            arr = [strip0, strip1, strip2, strip3, strip4, strip5];
            subsquare = 0;
            arrow = 3;
            break;
        
        default:
            return false;
    }

    //If the square does not have obstacles or walls, try placing a full square
    //If it does contain obstacles, try placing a strip instead
    if (!square.hasObstacles && !square.hasWall && (square.area <= mat.unusedArea)) {
        if (this.placeSquare(squareNo, subsquare, mat, lastSquareNo, -1)) {
            this.squares[lastSquareNo].setPath(mat);
            return true;      
        }
    } else {
        for (var i = 0; i < 6; ++i) {
            if (this.placeStrip(squareNo, arr[i], mat, lastSquareNo)) {
                this.squares[lastSquareNo].setPath(mat);
                return true;
            }
        }
    }
    return false;
};

/**
* Function sets color for each subsquare in a strip and 
* marks the centre point in the middle subsquare as a point for 
* the red line
* @param {int} squareNo - Index of square the strip is in
* @param {int | array} arr - Array containing indexes of the 5 subsquares
* @param {Mat} mat - The heating mat currently in use
*/
ResultGrid.prototype.colorArr = function(squareNo, arr, mat) {

    for (var i = 0; i < 5; ++i) {
        this.squares[squareNo].subsquares[arr[i]].setColor(mat);
    }
    this.squares[squareNo].subsquares[arr[2]].setPath(mat);
};