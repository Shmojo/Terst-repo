// from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {

  Function.prototype.bind = function (oThis) {

    if (typeof this !== "function") // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));    
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

var merge_options = function(from,to) {
  for( property in from) {
    if ( typeof options[property] == "object" ) {
      if ( !to[property] ) 
        to[property] = from[property]
      else
        merge_options( from[property], to[property] );
    } else {
      to[property] = from[property];
    }
  }
  return to;
};


var console_log = function(msg) {
  // console.log(msg);
};



var supportsTouch = 'createTouch' in document;

var Dots = function(options) {
  this.options = merge_options( options||{}, { 
    x:50, y:50, 
    width:800, height: 800, 
    frame_ms: 60,
    animate_ms: 300, // ms
    dots: { radius: 5, spacing: 40, offset_x: 20, offset_y: 20 } 
  });
};

// Touch events
// on~
  // touchstart, touchend, touchmove
  // gesturestart - a scale or a rotation starts.
  // gesturechange - a scale or a rotation.
  // gestureend 
//
// body.onorientationchange
//
Dots.prototype.defaultEventHandlers = function(options) {
  var _options = merge_options( options||{}, { 
    preventScrolling: true 
  });

      // event properties:
      // ( touches[] | targetTouches[] | changedTouches[] ) 
      // each of these have properties { clientX, clientY, screenX, screenY, pageX, pageY, target, identifier }
  return { 
    touchstart: function(e) {
      console_log("Touch Start:");

      if (options.preventScrolling) e.preventDefault();

      if ( e.touches.length == 1 ) {
        // start line candidate: 
        //   find closest point to evet touch down
        var x = event.touches[0].pageX;
        var y = event.touches[0].pageY;
        //   
      }
    },

    touchend: function(e) {
      console_log("Touch End:");
      console_log(e);
    },

    touchmove: function(e) {
      console_log("Touch Move:");
      console_log(e);
    },

    touchcancel: function(e) {
      console_log("Touch Cancel:");
      console_log(e);
    }
  };
};

Dots.prototype.setup = function() {
  console_log("Setting up");
  this.canvas = this.findOrCreateCanvas("canvas1");
  this.canvas.setAttribute("width", this.options.width);
  this.canvas.setAttribute("height", this.options.height);
  this.currentContext = this.canvas.getContext("2d");
  this.edges=[];
  this.configureEventHandlers(this.defaultEventHandlers({preventScrolling: true;}) );
};

// set up event handlers
Dots.prototype.configureEventHandlers = function( handlers ) {
  console_log('configureEventHandlers'); 
  
  // from matt.might.net/articles/how-to-native-iphone-ipad-apps-in-javascript/
  // included a event.preventDefault() in a touchmove event handler to prevent Safari from catching the event
  // document.body.addEventListener("touchmove", function(event) { event.preventDefault(); }, false ); // tell safari not to move window

  var triggers = Object.keys(handlers); 
  for (item in triggers) {
    var trigger=triggers[item];
    window.dots.canvas.addEventListener(trigger, handlers[trigger], false);
  }
};


Dots.prototype.findOrCreateCanvas = function(name) {
  console_log("findOrCreateCanvas");
  var e = document.getElementById("canvas1");
  if (!e) {
    console_log("Creating canvas");
    e = document.createElement("canvas");
    e.id = "canvas1";
    document.body.appendChild(e);
  }
  return e;
};

  // fillStyle, strokeStyle, lineWidth, and lineJoin are part of the state of the drawing context
Dots.prototype.context = function() { 
  if (!this.currentContext) {
    return (this.currentContext = this.canvas.getContext("2d"));
  }
  else {
    return this.currentContext;
  }
};

Dots.prototype.saveContext = function() { this.context.save(); };
Dots.prototype.restoreContext = function() { this.currentContext.restore(); };

Dots.prototype.eraseGrid = function() {
  console_log("eraseGrid");
  this.currentContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Dots.prototype.nearestGridPoint = function( x, y ) {
  return {
    row: Math.round( ( y - this.options.dots.offset_y ) / this.options.dots.spacing ),
    column: Math.round( ( x - this.options.dots.offset_x ) / this.options.dots.spacing )
  }
};


Dots.prototype.addEdge = function( gridPointFrom, gridPointTo, player ) {
  console_log("addEdge");
  this.edges.push( {
    from: gridPointFrom,
    to: gridPointTo,
    player: player
  });
};

Dots.prototype.drawEdge = function( edge ) {
  console_log("drawEdge");
  var gridPointFrom = edge.from;
  var gridPointTo = edge.to;
  var cxt=this.currentContext;
  cxt.beginPath();
  var coordinatesFrom = this.computeRowColumnCoordinates( gridPointFrom.row, gridPointFrom.column );
  var coordinatesTo = this.computeRowColumnCoordinates( gridPointTo.row, gridPointTo.column );
  cxt.moveTo( coordinatesFrom.x, coordinatesFrom.y );
  cxt.lineTo( coordinatesTo.x, coordinatesTo.y );
  cxt.closePath();
  ctx.stroke();
};

Dots.prototype.drawEdges = function() {
  console_log("drawEdges");
  for( var i=0; i<this.edges.length; ++i) {
    this.drawEdge( this.edges[i] );
  }
};

Dots.prototype.computeRowColumnCoordinates = function( row, column ) {
  return {
    x: column*this.options.dots.spacing+this.options.dots.offset_x,
    y: row*this.options.dots.spacing+this.options.dots.offset_y
  };
};

Dots.prototype.drawDot = function( row, column ) {
  console_log("drawDot");
  var cxt=this.currentContext;
  cxt.beginPath();
  var coordinates = this.computeRowColumnCoordinates( row, column );
  cxt.arc( 
      coordinates.x,
      coordinates.y,
      this.options.dots.radius, 
      0,  // begin angle in radians
      Math.PI*2,  // end angle in radians
      true // drawing direction anticlockwise?
  );
  cxt.closePath();
  cxt.fill();
};

Dots.prototype.setGrid = function() {
  console_log("setGrid");

  this.eraseGrid();

  this.gridRows = Math.floor( (this.options.height - this.options.dots.spacing) / this.options.dots.spacing);
  this.gridColumns = Math.floor( (this.options.width - this.options.dots.spacing) / this.options.dots.spacing);

  for ( var row =0; row<this.gridRows; ++row ) {
    for ( var column =0; column<this.gridColumns; ++column ) {
      this.drawDot( row, column );
    }
    console_log("Dots.setGrid(): row="+row+", column="+column);
  }
};

Dots.prototype.animateGrid = function() { 
  console_log( "animateGrid");
  var jiggle = function() {
    var random_direction = function() { return [-1,0,1][Math.floor(Math.random() * 3)]; };
    var offset_x = ( random_direction() * Math.floor(Math.random()*3) ) % this.options.dots.spacing;
    var offset_y = ( random_direction() * Math.floor(Math.random()*3) ) % this.options.dots.spacing;
    console_log( "jiggling, offset_x="+offset_x+", offset_y="+offset_y);
    this.options.dots.offset_x = this.options.dots.offset_x + offset_x;
    this.options.dots.offset_y = this.options.dots.offset_y + offset_y;
  };
  jiggle.bind(this)();
  this.setGrid();
};

Dots.prototype.startGridAnimation = function() {
  if ( this.intervalHandle ) {
    this.stopGridAnimation();
  }
  this.intervalHandle = window.setInterval( this.animateGrid.bind(this), this.options.frame_ms );
};

Dots.prototype.stopGridAnimation = function() {
  if ( this.intervalHandle ) {
    window.clearInterval(this.intervalHandle);
  }
};

var startDots = function() {
  console_log("Starting...");
  window.dots = new Dots();
  window.dots.setup();
  window.dots.setGrid();
//  window.dots.startGridAnimation();
//  window.setTimeout( window.dots.stopGridAnimation.bind(window.dots), dots.options.animate_ms );
};

console_log("Loading...");

if (typeof window.onload == "function") {
  var original_onload=window.onload;
  window.onload = function() { original_onload(); startDots(); }
} else {
  window.onload = startDots;
}
