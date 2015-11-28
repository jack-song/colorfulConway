$(document).ready(function(){
  var socket = io();
  var attachFastClick = Origami.fastclick;
  attachFastClick(document.body);

  var DEAD_COLOR = '#eeeeee';
  var TEST_DEAD_COLOR = 'rgb(238, 238, 238)';
  var USER_COLOR = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});

  window.songjack = window.songjack || {};

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

  var setCells = function (cells) {
    cells.forEach(function (cell) {
      window.songjack.game.addCell(cell);
      colorCell(cell);
    });
  }

  var setCursor = function (allowed) {
    document.getElementsByTagName('table')[0].style.cursor = allowed ? 'cell' : 'not-allowed';
  }

  //set up DOM listeners
  $('td').click(requestCell).mousedown(requestCell).mouseover(function () {
    if(isMousedown) {
      requestCell.call(this);
    }
  });

  socket.on('init', function(bundle) {
    window.songjack.game = new window.songjack.GameOfLife(bundle.map.cols, bundle.map.rows);

    setCells(bundle.cells);

    if(bundle.running) {
      window.songjack.gameIntervalID = setInterval(iterateGame, bundle.running);
    }

    setCursor(!bundle.running);
  });

  //set up socket listeners
  socket.on('newCell', function(cellData){
    window.songjack.game.addCell(cellData);
    colorCell(cellData);
  });

  socket.on('setup', function(){

    // clear the current game running id
    if(window.songjack.gameIntervalID) {
        clearInterval(window.songjack.gameIntervalID);
        window.songjack.gameIntervalID = null;
    }

    window.songjack.game.clear();
    $('td').css('background-color', DEAD_COLOR);
    setCursor(true);
  });

  socket.on('simulate', function(bundle){
    window.songjack.game.clear();
    setCells(bundle.cells);
    window.songjack.gameIntervalID = setInterval(iterateGame, bundle.interval);
    setCursor(false);
  });

  socket.on('countdown', function(data){
    var message = data.running ? 'Simulating! Next round in: ' : 'Place your cells! Round starts in: ';
    $('#alert').text(message + data.time);
  });

  var iterateGame = function() {
    var changedCells = window.songjack.game.iterate();

    changedCells.forEach(function(cell) {
      colorCell(cell);
    })
  }
});