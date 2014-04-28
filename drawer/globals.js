// Global variables.
/*

var grid,
    measurement,
    ourRoom,
    options,
    obstacles,
    finishedRoom = null,
    scrollBox,
    footmenu,
    tabs,
    resultGrid = null,
    mattur;
    */

var TFplanner =  TFplanner || {};

$(document).ready(function() {  

/*
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
    
    // initiates the options_container
    //options.initDraw();

*/


    (function () {

        TFplanner.grid = new Grid();
        console.log(window);
        TFplanner.scrollBox = new ScrollBox();
        TFplanner.measurement = new Measurement();
        TFplanner.ourRoom = new DrawRoom(20);
        TFplanner.tabs = new Tabs();
        TFplanner.footmenu = new FootMenu();
        TFplanner.options = new Options();
        TFplanner.obstacles = new Obstacles();
        TFplanner.mattur = new Mats();
        TFplanner.resultGrid = null;
        TFplanner.finishedRoom = null;
        
    })();
});


/**
 * Point constructor
**/
function Point (x, y) {
    this.x = x;
    this.y = y;
}