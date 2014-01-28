$(function() {  
    /*	var paper = new Raphael(document.getElementById('canvas_container'), 500, 500);  

    	for(var i = 0; i < 5; i+=1) {  
    	    var multiplier = i*5;  
    	    paper.circle(250 + (2*multiplier), 100 + multiplier, 50 - multiplier);  

    		

    	} 
    	var rectangle = paper.rect(200, 200, 250, 100); 
    */


// constructor
function Grid() {
        this.size = 6,               // How many pixels between each horizontal/vertical line.
        this.cutPix = 0.5;           // Used so that the drawing of a line not overlaps on the previous pixel.
        //this.paper = new Raphael(document.getElementById('canvas_container'));
}

Grid.prototype.paper = new Raphael(document.getElementById('canvas_container'));
Grid.prototype.offsetX = 1;
Grid.prototype.offsetY = 1;

Grid.prototype.draw = function() {

    var paper = this.paper,
        size = this.size,               
        cutPix = this.cutPix,           
        line,                   // Saves the path to a variable during construction.
        width = paper.width;    // The width and the height of the svg-element.
        height = paper.height;  

    // Draw vertical lines, with 'size' number of pixels between each line.
    for (var i = 1; i <= width; i++) {
        line = paper.path("M"+(i*size+cutPix)+", "+0+", L"+(i*size+cutPix)+", "+(size*height)).attr({'stroke-opacity': 0.3});   //Path-function is named 'paperproto.path' in raphael.js
        // Make every 10th line a bit stronger.
        if (i % 10 === 0) {
            line.attr( {
                'stroke-opacity': 0.5
            });
        }
    }

    // Draw horizontal lines, with 'size' number of pixels between each line.
    for (var i = 1; i <= height; i++) {
       line = paper.path("M"+0+", "+(i*size+cutPix)+", L"+(size*width)+", "+(i*size+cutPix)).attr({'stroke-opacity': 0.3});
       // Make every 10th line a bit stronger.
       if (i % 10 === 0) {
            line.attr( {
                'stroke-opacity': 0.5
            });
        } 
    }

    console.log(paper);

}

var grid = new Grid();

grid.draw();

Grid.prototype.getLatticePoint = function(x, y) {

  var tx = x - this.offsetX;
  var ty = y - this.offsetY;
  tx += this.size / 2;
  ty += this.size / 2;
  tx = parseInt(tx / this.size);
  ty = parseInt(ty / this.size);
  tx = Grid.range(tx, 0, this.width);
  ty = Grid.range(ty, 0, this.height);
  return new Point(tx, ty);
}

Grid.prototype.getReal = function(latticePoint) {
      var x = latticePoint.x * this.size + this.offsetX;
      var y = latticePoint.y * this.size + this.offsetY;

    //  alert('real: ' + latticePoint.x + " = x: " + x + " y: " + y);
    return new Point(x, y);
}

Grid.range = function(val, min, max) {
    if (val < min) 
        return min;
    if (val > max) 
        return max;
  return val;
}



var StartEnd = new Array();
var p1, p2;



$('#canvas_container').mousedown(function(e) {
    StartEnd[0] = e.offsetX;
    StartEnd[1] = e.offsetY;

    console.log(e);

    var p4 = grid.getLatticePoint(e.offsetX, e.offsetY);

    p1 = grid.getReal(p4);
});



$('#canvas_container').mouseup(function(e) {

    StartEnd[2] = e.offsetX;
    StartEnd[3] = e.offsetY;


    console.log(e);
    var p3 = grid.getLatticePoint(e.offsetX, e.offsetY);
    
    p2 = grid.getReal(p3);



console.log(p2);

    var tetronimo = grid.paper.path("M"+p1.x+","+p1.y+"L"+p2.x+","+p2.y).attr({fill: "#00000", stroke: "#000000"});
/*
$('#canvas_container').unbind('mousedown');

$('#canvas_container').unbind('mouseup');
*/
});


    var tetronimo = grid.paper.path("M 250 250 l 0 -50 l -50 0 l 0 -50 l -50 0 l 0 50 l -50 0 l 0 50 z");  
    tetronimo.attr(  
        {  
            gradient: '90-#526c7a-#64a0c1',  
            stroke: '#3b4449',  
            'stroke-width': 10,  
            'stroke-linejoin': 'round',  
            rotation: -90  
        }  
    );  
    tetronimo.animate({"transform": "r 360"}, 2000, 'bounce')

//MADking copyPaste:

function Point(x, y) {
    this.x = x;
    this.y = y;
}

});

