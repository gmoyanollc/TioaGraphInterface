// gCOMMENT_OUT
//#!/bin/env node
//  OpenShift sample Node application
//gINSERT
"use strict";
var express = require('express');
var fs      = require('fs');
//gINSERT BEGIN
var http 	= require('http');
var winston = require('winston');

var tgislayer 			= require('./tgislayer.js');
var tgismilitaryunit 	= require('./tgismilitaryunit.js');
var tgisview 			= require('./tgisview.js');

var TGIS_GRAPH_SERVICE_DEFAULT_IP 	= '127.0.0.1';    // local host
var TGIS_GRAPH_SERVICE_DEFAULT_PORT = '5555';
var TGIS_GRAPH_URL 					= 'http://localhost:7474/db/data/';
var TGIS_GRAPH_LOG_FOLDER			= './log/';
var XML_DOCUMENT_DECLARATION 		= '<?xml version="1.0" encoding="utf-8"?>\n';
var XML_TAG_RESPONSE_OPEN			= '<response><![CDATA[';
var XML_TAG_RESPONSE_CLOSE			= ']]></response>\n';
// gINSERT END

/**
 *  The TGIS Graph Interface provides a Module View Controller (MVC) 
 *  Representational State Transfer (ReST) interface to a Neo4j graph database instance.
 *    
 */
// gMODIFY
//var SampleApp = function() {
var ServerApp = function TgisGraphInterface() {

    //  Scope.
    var self = this;

    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */
    
	// gINSERT BEGIN
    self.initDependencies = function() {
		self.logfile = TGIS_GRAPH_LOG_FOLDER + self.constructor.name + '_' + new Date().toJSON().slice(0,10) + '.log';
		console.log('initializing log file: ' + self.logfile);
		winston.add(winston.transports.File, { filename: self.logfile, timestamp: true });
		winston.info('initialized log file: ' + self.logfile );
		http.get(TGIS_GRAPH_URL
				, function(res) {
					winston.info('graph database response status code: ' + res.statusCode);
					if (res.statusCode == 200) winston.info('graph database is up and running...just what I need!');
				}
			).on('error'
					, function(e) {
					winston.error('graph database response: ' + e.message)
					}
			);
    };
	// gINSERT END

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        // gINSERT
        if (typeof process.env.IP === "undefined") {
            self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
            self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;}
        // gINSERT BEGIN
            else {
            // c9 environment
            self.ipaddress = process.env.IP;
            self.port      = process.env.PORT;}
        // gINSERT END
        
        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            // gMODIFY BEGIN
            //console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            //self.ipaddress = "127.0.0.1";}
            winston.info('initialized default IP and PORT: ' + TGIS_GRAPH_SERVICE_DEFAULT_IP 
            		+ ':' + TGIS_GRAPH_SERVICE_DEFAULT_PORT);
            self.ipaddress = TGIS_GRAPH_SERVICE_DEFAULT_IP;
            // gMODIFY END
            // gINSERT BEGIN
            self.port = TGIS_GRAPH_SERVICE_DEFAULT_PORT;}
            else {
                winston.info('initialized IP: ' + self.ipaddress + ' and PORT: ' + self.port);}
        tgislayer.initialize(TGIS_GRAPH_URL, self.logfile);
        tgismilitaryunit.initialize(TGIS_GRAPH_URL, self.logfile);
        // gINSERT END
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
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
        	// gMODIFY
//        	console.log('%s: Received %s - terminating sample app ...',
//                       Date(Date.now()), sig);
        	winston.log('%s: Received %s - terminating ' + self.constructor.name,
                    Date(Date.now()), sig);
        	process.exit(1);
        }
        // gMODIFY
        //console.log('%s: Node server stopped.', Date(Date.now()) );
        winston.log('%s: Node server stopped.', Date(Date.now()) );
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

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
        
        /* gINSERT BEGIN */
        
        // layer routes
        self.routes['/tgis/layer/add'] = function(req, res) {
            var requestHostUrl = req.protocol + '://' + req.hostname;
            if (typeof(req.query.name) !== 'undefined' || typeof(req.query.lat) !== 'undefined' 
            	 || typeof(req.query.lon) !== 'undefined'){
            	tgislayer.add(req.query.name, req.query.lat, req.query.lon, res);
            }
                else { tgisview.sendErrorResponse(requestHostUrl, res) }
        };
        
        self.routes['/tgis/layer/addnode'] = function(req, res) {
            var requestHostUrl = req.protocol + '://' + req.hostname;
            if (typeof(req.query.name) !== 'undefined' || typeof(req.query.node) !== 'undefined') {
            	tgislayer.addNodeToLayer(req.query.name, req.query.node, res);
           	}
                else { tgisview.sendErrorResponse(requestHostUrl, res) }
        };
        
        self.routes['/tgis/layer/get'] = function(req, res) {
            var requestHostUrl = req.protocol + '://' + req.hostname;
            if (typeof(req.query.name) !== 'undefined') {
            	tgislayer.get(req.query.name, res) 
           	}
                else { tgisview.sendErrorResponse(requestHostUrl, res) }
        };
        
        // militaryunit routes
        self.routes['/tgis/militaryunit/add'] = function(req, res) {
            var requestHostUrl = req.protocol + '://' + req.hostname;
            if ( (typeof(req.query.name) !== 'undefined') || (typeof(req.query.lat) !== 'undefined') 
            		|| (typeof(req.query.lon) !== 'undefined') || (typeof(req.query.layerName) !== 'undefined') ) {
            	var nodeUrl = tgismilitaryunit.add(req.query.name, req.query.lat, req.query.lon, res);
            	tgislayer.addNodeToLayer(reg.query.layerName, nodeUrl) 
            }
            	else { tgisview.sendErrorResponse(requestHostUrl, res) }	
        };
        
        self.routes['/tgis/militaryunit/get'] = function(req, res) {
            var requestHostUrl = req.protocol + '://' + req.hostname;
            if (typeof(req.query.name) !== 'undefined') {
            	tgismilitaryunit.get(req.query.name, res)
            }
                else { tgisview.sendErrorResponse(requestHostUrl, res) }
        };

        self.routes['*'] = function(req, res) {
            var requestHostUrl = req.protocol + '://' + req.hostname;
            res.set('Content-Type', 'text/xml');
            res.send(XML_DOCUMENT_DECLARATION + XML_TAG_RESPONSE_OPEN 
            		+ "ERROR: Cannot GET " + req.path + " -- see " + 
            		+ requestHostUrl + " for proper usage." + XML_TAG_RESPONSE_CLOSE);
        }
        /* gINSERT END */
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        // gMODIFY
        //self.app = express.createServer();
        self.app = express();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
    	// gINSERT 
    	self.initDependencies();
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
        	// gMODIFY
//            console.log('%s: Node server started on %s:%d ...',
//                        Date(Date.now() ), self.ipaddress, self.port);
        	winston.info('Node server started on %s:%d', self.ipaddress, self.port);
        });
    };
};   /*  TgisGraphInterface  */



/**
 *  main():  Main code.
 */
// gMODIFY
//var zapp = new SampleApp();
var zapp = new ServerApp();
zapp.initialize();
zapp.start();

