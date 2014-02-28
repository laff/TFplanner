
// Global variables.
var grid,
    measurement,
    ourRoom,
    options,
    finishedRoom = null,
    scrollBox,
    headmenu,
    tabs;

$(document).ready(function() {  

    //Creates the grid on our page!
    grid = new Grid();

    //Initializes navigation_container
    scrollBox = new ScrollBox();

    // Starts the room creation progress!
    measurement = new Measurement();
    ourRoom = new DrawRoom(20);

    headmenu = new HeadMenu();
    tabs = new Tabs();
  
    // initiates the options_container
    options = new Options();
    //options.initDraw();
});


/**
 * Point constructor
**/
function Point (x, y) {
    this.x = x;
    this.y = y;
}



