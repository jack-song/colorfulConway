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

  //assumes 'this' is the DOM element
  var requestCell = function() {
    //only proceed if cell is dead
    //jquery only returns a stupid rgb string
    if($(this).css("background-color") == TEST_DEAD_COLOR) {
      socket.emit('requestCell', {
          name: $(this).attr('id'), 
          color: USER_COLOR
        }
      );
    }
  }

  $('td').mousedown(requestCell).mouseover(function () {
    if(isMousedown) {
      requestCell.call(this);
    }
  });
});