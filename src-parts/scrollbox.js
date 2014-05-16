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