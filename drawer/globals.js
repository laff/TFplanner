/**
 * @global
 * Namespace with the global TFplanner
**/
var TFplanner =  TFplanner || {};

$(document).ready(function() {  

    (function () {
        TFplanner.canvasContainer = 'canvas_container';
        TFplanner.menuContainer = 'menu';
        TFplanner.contentContainer = 'content_container';
        TFplanner.footContainer = 'footmenu';
        TFplanner.navContainer = 'navigation_container';
        TFplanner.pngContainer = 'myCanvas';
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