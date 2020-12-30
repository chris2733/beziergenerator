var canvas = document.querySelector('#bezierCanvasGen');

// setting window sizes in vars
var windowWidth = 200;
var windowHeight = 600;
// setting canvas params
canvas.width = windowWidth;
canvas.height = windowHeight;

// settings for canvas sizes stored here for later
var canvasWidth = windowWidth;
var canvasHeight = windowHeight;
// setting offset of canvas from top & bottom of window, for mouse detection
var canvasOffsetLeft;
var canvasOffsetTop;
getCanvasOffsets();
// -- rerun listeners on window scroll & resize
window.addEventListener('scroll', getCanvasOffsets);
window.addEventListener('resize', getCanvasOffsets);
// set current display id variables
var currentEasingP1 = document.querySelector('#currentEasingP1');
var currentEasingP2 = document.querySelector('#currentEasingP2');
var currentEasingP3 = document.querySelector('#currentEasingP3');
var currentEasingP4 = document.querySelector('#currentEasingP4');
// set id of transition demo to change style
var transitionDemo = document.querySelector('#transitionDemo');
// ids of speed slider
var speedSlider = document.querySelector('#speedSlider');
var speedSliderVal = document.querySelector('#speedSliderVal');
// id of bezier preset select
var presetBezierSelect = document.querySelector('#presetBezierSelect');

// start drawing
var paintbrush = canvas.getContext('2d');
// display id
var canvasEasingId = document.querySelector('#currentEasing');


// draw graph outline and wave
function drawGraph(startx, starty, graphHeight, graphWidth, colour) {

    /*  setting variables  */

    // setting graph dimensions
    this.startX = startx;
    this.startY = starty;
    this.graphWidth = graphWidth;
    this.graphHeight = graphHeight;

    // set position of x and y vals for line
    this.cubicP1 = 0.25;
    this.cubicP2 = 0.25;
    this.cubicP3 = 0.75;
    this.cubicP4 = 0.75;
    // set display to be correct
    currentEasingP1.innerHTML = this.cubicP1;
    currentEasingP2.innerHTML = this.cubicP2;
    currentEasingP3.innerHTML = this.cubicP3;
    currentEasingP4.innerHTML = this.cubicP4;

    // plot course of line start, starty, endx, endy
    this.linePosition = {
        p1: startx,
        p2: starty + graphHeight,
        p3: graphWidth,
        p4: starty,
    };

    // curve of bezier, needed to be within where the graph is, so points added to the height and starty point
    this.bezierPosition = {};

    // setting mouse position, initially 0
    this.mouseX = 0;
    this.mouseY = 0;
    // -- checking mouse movements
    this.mouseMoved = false;
    // -- which point to move
    this.mousePointToMove = false;

    // radius of points
    this.pointRadius = 10;
    this.firstPointFill = '#48bfe3';
    this.secondPointFill = '#5e60ce';
    this.pointStroke = '#efefef';
    this.lineStroke = '#1d3557';

    // setting speed of transition demo
    this.transitionSpeed = '300ms';



    /*  setting functions  */
    this.plotGraph = function(mouseMoveTriggered) {
        // clear canvas first
        paintbrush.clearRect(0,0,canvasWidth,canvasHeight);

        // set linewidth to be small as default
        paintbrush.lineWidth = 1;

        // draw graph outline
        paintbrush.beginPath();
        paintbrush.strokeStyle = colour;
        paintbrush.rect(this.startX, this.startY, this.graphWidth, this.graphHeight);
        paintbrush.stroke();

        // draw x and y text
        paintbrush.font = "14px Verdana";
        paintbrush.fillText("x", this.startX + 5, this.startY + 15);
        paintbrush.fillText("t", this.startX + this.graphWidth - 10, this.startY + this.graphHeight - 7);

        // setting bezier curve with current cubic points
        this.bezierPosition = {
            p1: this.cubicP1 * graphWidth,
            p2: this.startY + (this.graphHeight * (1- this.cubicP2)),
            p3: this.cubicP3 * graphWidth,
            p4: this.startY + (this.graphHeight * (1- this.cubicP4)),
        };

        // set the new line, calling the plotLine object
        this.plotLine(
            this.linePosition.p1,
            this.linePosition.p2,
            this.linePosition.p3,
            this.linePosition.p4,
            this.bezierPosition.p1,
            this.bezierPosition.p2,
            this.bezierPosition.p3,
            this.bezierPosition.p4,
            '#1d3557');

        this.drawPoints();

        this.updateDisplay();

    };

    // resets the cubic variables with new numbers passed in
    this.generateBezier = function(newP1, newP2, newP3, newP4) {
        // set new cubic variables for this object
        this.cubicP1 = newP1;
        this.cubicP2 = newP2;
        this.cubicP3 = newP3;
        this.cubicP4 = newP4;
        // generate graph again
        this.plotGraph();
    };

    // plots the line on the graph with the corrent curve according to cubc values
    this.plotLine = function(startx, starty, endx, endy, P1, P2, P3, P4, lineColour) {
        // set linewidth to be big here
        paintbrush.lineWidth = 3;
        // draw bezier line
        paintbrush.strokeStyle = lineColour;
        paintbrush.beginPath();
        paintbrush.moveTo(startx, starty);
        paintbrush.bezierCurveTo(P1, P2, P3, P4, endx, endy);
        paintbrush.stroke();
    }

    // set mouse point
    this.setPoint = function(mouseX, mouseY) {
        this.mouseX = mouseX;
        this.mouseY = mouseY;
        // if mousex sits within first bezier point
        if (
            this.mouseX > this.bezierPosition.p3 - this.pointRadius &&
            this.mouseX < this.bezierPosition.p3 + this.pointRadius &&
            this.mouseY > this.bezierPosition.p4 - this.pointRadius &&
            this.mouseY < this.bezierPosition.p4 + this.pointRadius
           ) {
            this.setMouseMove(true);
            this.mousePointToMove = 'second';
        } else if (
            this.mouseX > this.bezierPosition.p1 - this.pointRadius &&
            this.mouseX < this.bezierPosition.p1 + this.pointRadius &&
            this.mouseY > this.bezierPosition.p2 - this.pointRadius &&
            this.mouseY < this.bezierPosition.p2 + this.pointRadius
           ) {
            this.setMouseMove(true);
            this.mousePointToMove = 'first';
        };
    };

    this.movePoint = function(mousePointX, mousePointY) {
        // getting the inverted cubic y value becuase the graph is drawn from the top.. god dammit
        var cubicPointX = ((mousePointX - this.startX) / this.graphWidth).toFixed(2);
        var cubicPointY = ((mousePointY - this.startY) / this.graphHeight);
        // inverting cubic y becuase the graph is drawn from the top.. god dammit
        var cubicPointYNew = Math.abs(cubicPointY - 1).toFixed(2);
        if (cubicPointY > 1) {
            cubicPointYNew = -Math.abs(cubicPointYNew).toFixed(2);
        }
        if (this.mousePointToMove == 'first') {
            this.cubicP1 = cubicPointX;
            this.cubicP2 = cubicPointYNew;
            this.plotGraph();
            this.updateDisplay('first');
        } else {
            this.cubicP3 = cubicPointX;
            this.cubicP4 = cubicPointYNew;
            this.plotGraph();
            this.updateDisplay('second');
        }
    };

    // sets mouseMoved to false
    this.setMouseMove = function(boolean) {
        this.mouseMoved = boolean;
        if (boolean !== true) {
            // set no mousepoints to move
            this.mousePointToMove == false;
        } else {
            // set cursor to grab since its moving the points
            document.body.style.cursor = "grabbing";
        }
    };

    // draws the draggable points at the right position
    this.drawPoints = function() {
        // set linewidth to be small here
        paintbrush.lineWidth = 1;
        // draw line to first point
        paintbrush.beginPath();
        paintbrush.moveTo(this.linePosition.p1, this.linePosition.p2);
        paintbrush.lineTo(this.bezierPosition.p1, this.bezierPosition.p2);
        paintbrush.strokeStyle = this.lineStroke;
        paintbrush.stroke();
        // draw first point
        paintbrush.beginPath();
        paintbrush.arc(this.bezierPosition.p1,this.bezierPosition.p2,this.pointRadius,0,Math.PI*2);
        paintbrush.fillStyle = this.firstPointFill;
        paintbrush.fill();
        paintbrush.strokeStyle = this.pointStroke;
        paintbrush.stroke();
        // draw line to second point
        paintbrush.beginPath();
        paintbrush.moveTo(this.linePosition.p3, this.linePosition.p4);
        paintbrush.lineTo(this.bezierPosition.p3, this.bezierPosition.p4);
        paintbrush.strokeStyle = this.lineStroke;
        paintbrush.stroke();
        // draw second point
        paintbrush.beginPath();
        paintbrush.arc(this.bezierPosition.p3,this.bezierPosition.p4,this.pointRadius,0,Math.PI*2);
        paintbrush.fillStyle = this.secondPointFill;
        paintbrush.fill();
        paintbrush.strokeStyle = this.pointStroke;
        paintbrush.stroke();
    };

    // updates the display showing easing information
    this.updateDisplay = function(point) {
        // updating each individual id pair
        if (point == 'first') {
            currentEasingP1.innerHTML = this.cubicP1;
            currentEasingP2.innerHTML = this.cubicP2;
        } else if (point == 'second') {
            currentEasingP3.innerHTML = this.cubicP3;
            currentEasingP4.innerHTML = this.cubicP4;
            // if nothing specified, update both
        } else {
            currentEasingP1.innerHTML = this.cubicP1;
            currentEasingP2.innerHTML = this.cubicP2;
            currentEasingP3.innerHTML = this.cubicP3;
            currentEasingP4.innerHTML = this.cubicP4;
        };
        this.updateTransitionDemo();
    };

    // update transition demo
    this.updateTransitionDemo = function() {
        var cubicString = this.cubicP1 + "," + this.cubicP2 + "," + this.cubicP3 + "," + this.cubicP4 + ")";
        transitionDemo.setAttribute("style","transition:all " + this.transitionSpeed +  " cubic-bezier(" + cubicString);
    };

    // update speed of transition
    this.updateTransitionSpeed = function(speed) {
        this.transitionSpeed = speed + 'ms';
        speedSliderVal.innerHTML = this.transitionSpeed;
        this.updateTransitionDemo();
    };

}



// listening for clicking on the drawpoints
canvas.addEventListener("mousedown", function(e) {
    // setting position of mouse
    newGraph.setPoint(e.x - canvasOffsetLeft, e.y - canvasOffsetTop);
});

// listening for mousemove on canvas, only if mouse is down, and if clicked in drawpoints
canvas.addEventListener("mousemove", function(e) {
    if (newGraph.mouseMoved == true) {
        newGraph.movePoint(e.x - canvasOffsetLeft, e.y - canvasOffsetTop);
    }
});

// listening for mouse up to stop moving point
window.addEventListener("mouseup", function(e) {
    document.body.style.cursor = 'auto';
    // setting position of mouse
    if (newGraph.mouseMoved == true) {
        newGraph.setMouseMove(false);
    }
});


// listening for range slider change, to change value next to it
speedSlider.addEventListener('input', function(e) {
    var newSpeed = e.target.value;
    newGraph.updateTransitionSpeed(newSpeed);
});

// listening for preset bezierselect to change
presetBezierSelect.addEventListener('change', function(e) {
    var newPreset = JSON.parse(e.target.value);
    newGraph.generateBezier(newPreset[0],newPreset[1],newPreset[2],newPreset[3]);
});






// creating a new graph
var newGraph = new drawGraph(1, windowHeight*0.3, windowWidth, windowWidth-2, '#5e60ce');
newGraph.plotGraph();

// generate a new bezier curve
newGraph.generateBezier(.25,.25,.75,.75);



// function for getting canvas offsets
function getCanvasOffsets() {
    console.log("TESST");
    canvasOffsetLeft = canvas.getBoundingClientRect().left;
    canvasOffsetTop = canvas.getBoundingClientRect().top;
};