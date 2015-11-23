#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var jade    = require('jade');
var GameOfLife = require(__dirname + '/GameOfLife.js');
var cellFactory = require(__dirname + '/cellFactory.js');
var MAP_SIZE = {
    rows: '40',
    cols: '70'
};

var SETUP_TIME = 15+1;
var SIM_TIME = 40+1;
var INTERATION_TIME = 200;
//per round
var REQUEST_LIMIT = 100;

/**
 *  Define the sample application.
 */
var ColorfulConway = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };

        self.game = new GameOfLife(MAP_SIZE.cols, MAP_SIZE.rows);

        //track requests made by each client
        self.clearRequests();
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        var jadeOptions = {cache: true};


        // compile map/index
        var generateMap = jade.compileFile(__dirname + '/../views/index.jade', jadeOptions);

        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index': '' };
        }

        // put the generated html into memory cache
        self.zcache['index'] = generateMap(MAP_SIZE);
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');

            res.send(self.cache_get('index') );
        };
    };

    self.connectSockets = function() {
        self.io.on('connection', function(socket) {
            //send message with data of current cells right away
            socket.emit('currentCells', self.game.getCurrentCells());

            socket.on('requestCell', function(cellData) {

                //start tracking # requests made by each client
                if(!self.cellRequests[socket.id]) {
                    self.cellRequests[socket.id] = 0;
                }

                //only allowed if within request limit
                if(self.cellRequests[socket.id] < REQUEST_LIMIT) {
                    //if added sucessfully
                    if(self.game.addCell(cellData)){
                        self.io.emit('newCell', cellData);
                        self.cellRequests[socket.id]++;
                    }
                }
            });
        });
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.app = express();
        self.http = require('http').Server(self.app);
        self.io = require('socket.io')(self.http);

        self.createRoutes();
        self.connectSockets();

        self.app.use(express.static('client'));

        //for jade templating (not really used right now)
        //self.app.set('views', __dirname + '/../views');
        //self.app.set('view engine', 'jade');


        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };

    self.iterateGame = function() {
        self.io.emit('iterate', self.game.iterate());
    }

    self.countdown = function(startTime) {
        var time = startTime;
        self.countdownIntervalID = setInterval(function() {
            time--;
            self.io.emit('countdown', {'time': time, 'running': !!self.gameIntervalID});
        }, 1000);
    }

    self.clearRequests = function() {
        if(self.cellRequests) {
            delete self.cellRequests;
        }

        self.cellRequests = {};
    }

    self.enterSetup = function() {
        //stop any countdowns
        if(self.countdownIntervalID) {
            clearInterval(self.countdownIntervalID);
        }

        // clear the current game running id
        if(self.gameIntervalID) {
            clearInterval(self.gameIntervalID);
            self.gameIntervalID = null;
        }

        self.clearRequests();
        self.game.clear();
        self.io.emit('clear');

        setTimeout(self.enterSimulation, SETUP_TIME*1000);
        self.countdown(SETUP_TIME);
    }

    self.enterSimulation = function() {
        //stop any countdowns
        if(self.countdownIntervalID) {
            clearInterval(self.countdownIntervalID);
        }

        self.clearRequests();
        self.gameIntervalID = setInterval(self.iterateGame, INTERATION_TIME);
        setTimeout(self.enterSetup, SIM_TIME*1000);
        self.countdown(SIM_TIME);
    }


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.http.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });

        self.enterSetup();
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new ColorfulConway();
zapp.initialize();
zapp.start();

