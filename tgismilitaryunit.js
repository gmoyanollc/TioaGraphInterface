"use strict";
var request 	= request || require('request');
var tgisview 	= tgisview || require('./tgisview.js');

//var NODE_LABEL					= 'MiltaryUnit';
	
var tgismilitaryunit = tgismilitaryunit || {
	tgisGraphUrl: "", 
	tgisGraphServiceLogFile: "",
	
	initialize: function (url, filename){
		this.tgisGraphUrl = url;
		this.tgisGraphServiceLogFile = filename;
	},
	
	add: function (name, lat, lon, res) {
		
	    var nodeUrl;
		request.post(
	    		this.tgisGraphUrl + "node" 
	    		, {json: { 
//	    			'labels' 	: NODE_LABEL
	    			'labels' 	: this.constructor.name
	    			, 'name' 	: name
		   			, 'lat' 	: lat
		   			, 'lon' 	: lon 
		   			}}
			    , function(error, response, body) {
			    	tgisview.sendGraphResponse(error, response, body, res) }
	    );
		return nodeUrl;
	},
	    
	get: function (name, res) {
		
		//var self = this;
	    request.post(
		    	this.tgisGraphUrl + "getNode"	//?
				, {json: { 'nodeid' : name}} //?
		    	, function(error, response, body) {
		    		tgisview.sendGraphResponse(error, response, body, res) }
	    );
	}

};   /* tgismilitaryunit namespace */

module.exports = tgismilitaryunit;
