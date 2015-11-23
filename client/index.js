$(document).ready(function(){
  var socket = io();
  var attachFastClick = Origami.fastclick;
  attachFastClick(document.body);

  var DEAD_COLOR = '#eeeeee';
  var TEST_DEAD_COLOR = 'rgb(238, 238, 238)';
  var USER_COLOR = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});

  var isMousedown = false;   // Tracks status of mouse button
  $(document).mousedown(function() {
    isMousedown = true;      // When mouse goes down, set isDown to true
  })
  .mouseup(function() {
    isMousedown = false;    // When mouse goes up, set isDown to false
  });

  var colorCell = function(cellData) {
    var jcell = $('#' + cellData.x + '-' + cellData.y);

    jcell.css('background-color', cellData.alive ? cellData.css : DEAD_COLOR);
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
          alive: true,
          css: USER_COLOR
        }
      );
    }
  }

  //set up DOM listeners
  $('td').click(requestCell).mousedown(requestCell).mouseover(function () {
    if(isMousedown) {
      requestCell.call(this);
    }
  });

  //set up socket listeners
  socket.on('newCell', function(cellData){
    colorCell(cellData);
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
    var message = data.running ? 'Interact! Next round in: ' : 'Place your cells! Round starts in: ';
    $('#alert').text(message + data.time);
  });
});