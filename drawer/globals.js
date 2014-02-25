
// Global variables.
var grid,
    measurement,
    ourRoom,
    options,
    finishedRoom = null;

$(document).ready(function() {  

    grid = new Grid();
    grid.draw();
    grid.menuBox(0, 0);
    grid.zoom();

    // Starts the room creation progress!
    measurement = new Measurement();
    ourRoom = new drawRoom(20);

    
    // initiates the options_container
    options = new Options();
    options.initOpt();

});


/**
 * Point constructor
**/
function Point (x, y) {
    this.x = x;
    this.y = y;
}



