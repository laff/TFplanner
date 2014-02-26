
// Global variables.
var grid,
    measurement,
    ourRoom,
    options,
    finishedRoom = null;

$(document).ready(function() {  

    //Creates the grid on our page!
    grid = new Grid();

    // Starts the room creation progress!
    measurement = new Measurement();
    ourRoom = new DrawRoom(20);

    
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



