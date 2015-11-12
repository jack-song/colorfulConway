$(document).ready(function(){
  var socket = io();
  var DEAD_COLOR = '#eeeeee';
  var TEST_DEAD_COLOR = 'rgb(238, 238, 238)';
  //not used yet
  var USER_COLOR = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});

  var isMousedown = false;   // Tracks status of mouse button
  $(document).mousedown(function() {
    isMousedown = true;      // When mouse goes down, set isDown to true
  })
  .mouseup(function() {
    isMousedown = false;    // When mouse goes up, set isDown to false
  });

  var colorCell = function(cell) {
    var jcell = $('#' + cell.id);

    jcell.css('background-color', cell.alive ? cell.css : DEAD_COLOR);
  }

  //assumes 'this' is the DOM element
  var requestCell = function() {
    //only proceed if cell is dead
    //jquery only returns a stupid rgb string
    if($(this).css("background-color") == TEST_DEAD_COLOR) {
      var coords = $(this).attr('id').split('-');

      socket.emit('requestCell', {
          x: coords[0],
          y: coords[1],
          color: USER_COLOR
        }
      );
    }
  }

  //set up DOM listeners
  $('td').mousedown(requestCell).mouseover(function () {
    if(isMousedown) {
      requestCell.call(this);
    }
  });

  //set up socket listeners
  socket.on('newCell', function(cell){
    colorCell(cell);
  });

  socket.on('currentCells', function(cells){
    cells.forEach(colorCell);
  });

  socket.on('iterate', function(cells){
    cells.forEach(colorCell);
  });

  socket.on('clear', function(){
    $('td').css('background-color', DEAD_COLOR);
  });

  socket.on('countdown', function(data){
    console.log(data);
  });
});