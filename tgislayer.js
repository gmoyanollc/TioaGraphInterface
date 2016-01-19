"use strict";
var request 	= request || require('request');
var tgisview 	= tgisview || require('./tgisview.js');

var TGIS_GRAPH_SPATIALPLUGIN = 'ext/SpatialPlugin/graphdb/';

var tgislayer = tgislayer || {
	tgisGraphUrl: "",
	tgisGraphServiceLogFile: "",
	
	initialize: function (url, filename){
		this.tgisGraphUrl = url;
		this.tgisGraphServiceLogFile = filename;
	},
	
	add: function (name, lat, lon, res) {
		
	    request.post(
	    		this.tgisGraphUrl + TGIS_GRAPH_SPATIALPLUGIN + "addSimplePointLayer" 
	    		, {json: { 
		   			'layer' : name,
		   			'lat' 	: lat,
		   			'lon' 	: lon }}
			    , function(error, response, body) {
			    	tgisview.sendGraphResponse(error, response, body, res) }
	    );
	},
	    
	addNodeToLayer: function (name, nodeUrl) {
		
	    request.post(
	    		nodeUrl
	    		, {json: { 
		   			'layer'		: name
		   			, 'node' 	: nodeUrl 
		   			}}
			    , function(error, response, body) {
			    	tgisview.sendGraphResponse(error, response, body, res) }
	    );
	},

	get: function (name, res) {
		
	    request.post(
		    	this.tgisGraphUrl + TGIS_GRAPH_SPATIALPLUGIN + "getLayer"
				, {json: { 'layer' : name}}
		    	, function(error, response, body) {
		    		tgisview.sendGraphResponse(error, response, body, res) }
	    );
	}

};   /* tgislayer namespace */

module.exports = tgislayer;
