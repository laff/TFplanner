// Global variables.
var grid,
    measurement,
    ourRoom,
    options,
    obstacles,
    finishedRoom = null,
    scrollBox,
    footmenu,
    tabs,
    finishedRoom = null,
    resultGrid = null,
    mattur;

$(document).ready(function() {  

    //Creates the grid on our page!
    grid = new Grid();

    //Initializes navigation_container
    scrollBox = new ScrollBox();

    // Starts the room creation process!
    measurement = new Measurement();
    ourRoom = new DrawRoom(20);

    tabs = new Tabs();
    footmenu = new FootMenu();
    options = new Options();

    obstacles = new Obstacles();

    mattur = new Mats();

    // initiates the options_container
    //options.initDraw();
});


/**
 * Point constructor
**/
function Point (x, y) {
    this.x = x;
    this.y = y;
}