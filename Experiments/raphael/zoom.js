    var paper = Raphael('paper');
    paper.setViewBox(0,0,paper.width,paper.height);
var c = paper.rect(0,0,50,50).attr({'fill':'#e0e0e0'});
    c.translate((paper.width / 2) - (c.attr('width') / 2), (paper.height / 2) - (c.attr('height') / 2));



var viewBoxWidth = paper.width;
var viewBoxHeight = paper.height;
var canvasID = "#paper";
var startX,startY;
var mousedown = false;
var dX,dY;
var oX = 0, oY = 0, oWidth = viewBoxWidth, oHeight = viewBoxHeight;
var viewBox = paper.setViewBox(oX, oY, viewBoxWidth, viewBoxHeight);
viewBox.X = oX;
viewBox.Y = oY;
var vB = paper.rect(viewBox.X,viewBox.Y,viewBoxWidth,viewBoxHeight)
    .attr({stroke: "#009", "stroke-width": 3});;


    /** This is high-level function.
     * It must react to delta being more/less than zero.
     */
    function handle(delta) {
        vBHo = viewBoxHeight;
        vBWo = viewBoxWidth;
        if (delta < 0) {
        viewBoxWidth *= 0.95;
        viewBoxHeight*= 0.95;
        }
        else {
        viewBoxWidth *= 1.05;
        viewBoxHeight *= 1.05;
        }
/*
        vB.attr({
          x: viewBox.X,
          y: viewBox.Y,
          width: viewBoxWidth,
          height: viewBoxHeight
        });
 */
                        
  viewBox.X -= (viewBoxWidth - vBWo) / 2;
  viewBox.Y -= (viewBoxHeight - vBHo) / 2;          paper.setViewBox(viewBox.X,viewBox.Y,viewBoxWidth,viewBoxHeight);
    }

    /** Event handler for mouse wheel event.
     */
    function wheel(event){
            var delta = 0;
            if (!event) /* For IE. */
                    event = window.event;
            if (event.wheelDelta) { /* IE/Opera. */
                    delta = event.wheelDelta/120;
            } else if (event.detail) { /** Mozilla case. */
                    /** In Mozilla, sign of delta is different than in IE.
                     * Also, delta is multiple of 3.
                     */
                    delta = -event.detail/3;
            }
            /** If delta is nonzero, handle it.
             * Basically, delta is now positive if wheel was scrolled up,
             * and negative, if wheel was scrolled down.
             */
            if (delta)
                    handle(delta);
            /** Prevent default actions caused by mouse wheel.
             * That might be ugly, but we handle scrolls somehow
             * anyway, so don't bother here..
             */
            if (event.preventDefault)
                    event.preventDefault();
        event.returnValue = false;
    }

    /** Initialization code. 
     * If you use your own event management code, change it as required.
     */
    if (window.addEventListener)
            /** DOMMouseScroll is for mozilla. */
            window.addEventListener('DOMMouseScroll', wheel, false);
    /** IE/Opera. */
    window.onmousewheel = document.onmousewheel = wheel;

//Pane
        $(canvasID).mousedown(function(e){
            
            if (paper.getElementByPoint( e.pageX, e.pageY ) != null) {return;}
            mousedown = true;
            startX = e.pageX; 
            startY = e.pageY;    
        });

        $(canvasID).mousemove(function(e){
            if (mousedown == false) {return;}
            dX = startX - e.pageX;
            dY = startY - e.pageY;
            x = viewBoxWidth / paper.width; 
            y = viewBoxHeight / paper.height; 

            dX *= x; 
            dY *= y; 
            //alert(viewBoxWidth +" "+ paper.width );
            
            paper.setViewBox(viewBox.X + dX, viewBox.Y + dY, viewBoxWidth, viewBoxHeight);

        })
            
        $(canvasID).mouseup(function(e){
            if ( mousedown == false ) return; 
            viewBox.X += dX; 
            viewBox.Y += dY; 
            mousedown = false; 
            
        });