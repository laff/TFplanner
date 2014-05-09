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