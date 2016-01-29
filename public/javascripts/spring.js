/**
 * Move controller and track ball animation and dynamics code
 * Created by moviezhou on 15-9-18.
 */
/*
* Draw move & arm controler pad
* */
var paper = Raphael(document.getElementById("move-ctrl"), 210, 210);  // move controller
var armxypad = Raphael(document.getElementById("arm-xy"),200, 200);   // arm controller

var ctrlw = armxypad.circle(100, 30, 30);              // 'W', forward
armxypad.text(100,30, "W").attr("font-size","16px");
var ctrla = armxypad.circle(30, 100, 30);              // 'A', left
armxypad.text(30, 100, "A").attr("font-size","16px");
var ctrls = armxypad.circle(100, 170, 30);             // 'S', backward
armxypad.text(100, 170, "S").attr("font-size","16px");
var ctrld = armxypad.circle(170, 100, 30);             // 'D', right
armxypad.text(170, 100, "D").attr("font-size","16px");

var c = paper.image("images/knob_bg.png", 0, 0, 210, 210);  //  Move controller background image

// Draw move controller's axis X,Y
paper.path("M17,105L105,105");
paper.path("M105,105L193,105");
paper.path("M105,105L105,17");
paper.path("M105,105L105,193");

var circle = paper.image("images/gamestick.png", 80, 80, 50, 50); // track ball image

var buttonSet = armxypad.set();
buttonSet.push(
    ctrlw,
    ctrla,
    ctrls,
    ctrld
);

/* Arm event array*/
var armxyHandler = [onWdown, onAdown, onSdown, onDdown];

/* Add arm event to buttonSet*/
for(var i=0; i<4; i++){
    buttonSet[i].attr("fill", "#008CBA"); //light red #f00
    buttonSet[i].attr("opacity", "0.8");
    buttonSet[i].attr("stroke", "#fff");

    buttonSet[i].mousedown(armxyHandler[i]);
    buttonSet[i].mouseup(onKeyUp);
}

/*Event handlers*/
function onWdown(){
    $('#arm-directxy').text("W");
    socket.emit('armXY', 'W');
}

function onAdown(){
    $('#arm-directxy').text("A");
    socket.emit('armXY', 'A');
}

function onSdown(){
    $('#arm-directxy').text("S");
    socket.emit('armXY', 'S');
}

function onDdown(){
    $('#arm-directxy').text("D");
    socket.emit('armXY', 'D');
}

function onKeyUp(){
    $('#arm-directxy').text("STOP");
    socket.emit('armXY', 'STOP');
}


// Animation functions
var start = function () {
        this.x = this.attr("x");
        this.y = this.attr("y");
    },
    move = function (dx, dy) {
        this.attr({x: this.x + dx, y: this.y + dy});
        var speed = computeMoveSpeed(this.x + dx, this.y + dy);
        var angle = computeMoveAngle(this.x + dx, this.y + dy);

        socket.emit('move', {movSpeed: speed, movAngle: angle});
    },
    up = function () {
        this.animate({r: 30, x: 80, y:80}, 200, ">", stop);
    };
circle.drag(move, start, up);


/*
* Get current angle between x axis and track ball's center, clockwise
* */
function computeMoveAngle(x, y){
    var angle = Math.floor(Raphael.angle(x + 20, y + 20, 100, 0, 100, 100));
    angle = angle < 0 ? angle + 360 : angle;
    $('#direct-angle').text(angle);
    return angle
}

/*
* Get distance between origin point and track ball's center, represent move speed
* */
function computeMoveSpeed(x, y){
    var speed = Math.floor(Math.sqrt(Math.pow(x-80,2) + Math.pow(y-80,2)));
    $('#direct-pos').text(speed);
    return speed
}


/*
* Stop move event handler
* */
function stop(){
    $('#direct-pos').text('0');
    $('#direct-angle').text('0');
    socket.emit('stop', {movSpeed: 0, movAngle: 0});
}
